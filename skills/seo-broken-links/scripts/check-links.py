#!/usr/bin/env python3
"""Find broken links on a page, sitemap, or crawled site."""
from __future__ import annotations

import argparse
import csv
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; SEO-Broken-Links/1.0)"
HEADERS = {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"}


def fetch(url: str, timeout: int, follow_redirects: bool = True) -> tuple[int, str, list[str]]:
    """Return (status, final_url, redirect_chain). Status -1 on error."""
    try:
        r = requests.get(
            url,
            headers=HEADERS,
            timeout=timeout,
            allow_redirects=follow_redirects,
            stream=True,
        )
        chain = [h.url for h in r.history] + [r.url]
        return r.status_code, r.url, chain
    except requests.RequestException as e:
        return -1, str(e), []


def extract_links(url: str, html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        absolute = urljoin(url, href)
        if absolute.startswith(("http://", "https://")):
            links.append(absolute)
    return list(dict.fromkeys(links))


def is_internal(link: str, base: str) -> bool:
    return urlparse(link).netloc == urlparse(base).netloc


def check_links(
    pages: dict[str, list[str]],
    timeout: int,
    follow_redirects: bool,
    workers: int = 16,
) -> tuple[list[dict], list[dict], int]:
    """Check every unique link, return (broken, redirects, total_checked)."""
    seen: dict[str, list[str]] = defaultdict(list)
    for src, links in pages.items():
        for link in links:
            seen[link].append(src)

    broken, redirects = [], []

    def task(link: str) -> tuple[str, int, list[str]]:
        status, final, chain = fetch(link, timeout, follow_redirects)
        return link, status, chain

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(task, link) for link in seen]
        for f in as_completed(futures):
            link, status, chain = f.result()
            if status == -1 or status >= 400:
                broken.append({"url": link, "status": status, "sources": seen[link]})
            elif len(chain) > 2:
                redirects.append({"url": link, "chain": chain, "sources": seen[link]})

    return broken, redirects, len(seen)


def crawl(start: str, max_pages: int, timeout: int) -> dict[str, list[str]]:
    visited: dict[str, list[str]] = {}
    queue = [start]
    while queue and len(visited) < max_pages:
        url = queue.pop(0)
        if url in visited:
            continue
        status, _, _ = fetch(url, timeout)
        if status != 200:
            visited[url] = []
            continue
        try:
            r = requests.get(url, headers=HEADERS, timeout=timeout)
            links = extract_links(url, r.text)
        except requests.RequestException:
            visited[url] = []
            continue
        visited[url] = links
        for link in links:
            if is_internal(link, start) and link not in visited:
                queue.append(link)
    return visited


def parse_sitemap(url: str, timeout: int) -> list[str]:
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    root = ET.fromstring(r.text)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]
    return urls


def page_links(url: str, timeout: int) -> dict[str, list[str]]:
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return {url: extract_links(url, r.text)}


def filter_links(pages: dict[str, list[str]], base: str, mode: str) -> dict[str, list[str]]:
    if mode == "all":
        return pages
    out = {}
    for src, links in pages.items():
        if mode == "internal":
            out[src] = [l for l in links if is_internal(l, base)]
        else:
            out[src] = [l for l in links if not is_internal(l, base)]
    return out


def print_report(broken: list[dict], redirects: list[dict], total: int) -> None:
    print(f"\n[BROKEN] {len(broken)} found")
    for b in broken:
        status = b["status"] if b["status"] != -1 else "ERR"
        print(f"  {b['url']} ({status})")
        for src in b["sources"][:3]:
            print(f"    sourced from: {src}")
        if len(b["sources"]) > 3:
            print(f"    ...and {len(b['sources']) - 3} more")

    print(f"\n[REDIRECT CHAIN] {len(redirects)} found")
    for r in redirects:
        chain_str = " -> ".join(r["chain"])
        print(f"  {chain_str}")
        for src in r["sources"][:2]:
            print(f"    sourced from: {src}")

    print(f"\nChecked: {total} unique links")


def write_csv(path: str, broken: list[dict], redirects: list[dict]) -> None:
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["category", "url", "status_or_chain", "sources"])
        for b in broken:
            w.writerow(["broken", b["url"], b["status"], "; ".join(b["sources"])])
        for r in redirects:
            w.writerow(["redirect", r["url"], " -> ".join(r["chain"]), "; ".join(r["sources"])])


def main() -> int:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    pp = sub.add_parser("page")
    pp.add_argument("url")
    sp = sub.add_parser("site")
    sp.add_argument("url")
    sp.add_argument("--max-pages", type=int, default=50)
    smp = sub.add_parser("sitemap")
    smp.add_argument("url")

    for s in (pp, sp, smp):
        s.add_argument("--timeout", type=int, default=10)
        s.add_argument("--external-only", action="store_true")
        s.add_argument("--internal-only", action="store_true")
        s.add_argument("--no-redirects", action="store_true")
        s.add_argument("--csv", default=None)

    args = p.parse_args()
    follow_redirects = not args.no_redirects

    if args.cmd == "page":
        pages = page_links(args.url, args.timeout)
        base = args.url
    elif args.cmd == "site":
        pages = crawl(args.url, args.max_pages, args.timeout)
        base = args.url
    else:
        urls = parse_sitemap(args.url, args.timeout)
        pages = {}
        for u in urls:
            try:
                pages.update(page_links(u, args.timeout))
            except requests.RequestException:
                pages[u] = []
        base = urls[0] if urls else args.url

    mode = "all"
    if args.internal_only:
        mode = "internal"
    elif args.external_only:
        mode = "external"
    pages = filter_links(pages, base, mode)

    broken, redirects, total = check_links(pages, args.timeout, follow_redirects)
    print_report(broken, redirects, total)
    if args.csv:
        write_csv(args.csv, broken, redirects)
        print(f"\nCSV written to {args.csv}")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
