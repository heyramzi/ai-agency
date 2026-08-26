#!/usr/bin/env python3
"""Google Search Console CLI via gcloud auth.

Queries the Search Console API using gcloud application-default credentials.
Requires: gcloud CLI with application-default login that includes webmasters scope.

Setup (one-time):
    gcloud auth application-default login \
        --scopes=openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly

Usage:
    python3 gsc.py sites                              # List verified sites
    python3 gsc.py query <site_url> [options]          # Query search analytics
    python3 gsc.py top-queries <site_url> [options]    # Top queries by clicks
    python3 gsc.py top-pages <site_url> [options]      # Top pages by clicks
    python3 gsc.py compare <site_url> [options]        # Compare two date ranges
    python3 gsc.py gaps <site_url> [options]           # High-impression, low-CTR queries
"""

import argparse
import json
import subprocess
import sys
import urllib.request
from datetime import datetime, timedelta


API_BASE = "https://searchconsole.googleapis.com"


def get_access_token():
    """Get access token from gcloud application-default credentials."""
    result = subprocess.run(
        ["gcloud", "auth", "application-default", "print-access-token"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print("Error: Could not get access token.", file=sys.stderr)
        print("Run: gcloud auth application-default login "
              "--scopes=openid,https://www.googleapis.com/auth/userinfo.email,"
              "https://www.googleapis.com/auth/cloud-platform,"
              "https://www.googleapis.com/auth/webmasters.readonly",
              file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def get_quota_project():
    """Get the current gcloud project for quota billing."""
    result = subprocess.run(
        ["gcloud", "config", "get-value", "project"],
        capture_output=True, text=True
    )
    if result.returncode == 0 and result.stdout.strip():
        return result.stdout.strip()
    return None


def _headers(token):
    """Build common request headers with auth and quota project."""
    h = {"Authorization": f"Bearer {token}"}
    project = get_quota_project()
    if project:
        h["x-goog-user-project"] = project
    return h


def api_get(path, token):
    """GET request to Search Console API."""
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url, headers=_headers(token))
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"API Error {e.code}: {body}", file=sys.stderr)
        sys.exit(1)


def api_post(path, token, data):
    """POST request to Search Console API."""
    url = f"{API_BASE}{path}"
    payload = json.dumps(data).encode()
    headers = _headers(token)
    headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=payload, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"API Error {e.code}: {body}", file=sys.stderr)
        sys.exit(1)


def default_dates(days=28):
    """Return (start_date, end_date) strings for the last N days."""
    end = datetime.now() - timedelta(days=3)  # GSC data has ~3 day lag
    start = end - timedelta(days=days)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


def format_table(headers, rows, alignments=None):
    """Format data as an aligned text table."""
    if not rows:
        print("No data returned.")
        return

    str_rows = [[str(c) for c in row] for row in rows]
    widths = [max(len(h), max((len(r[i]) for r in str_rows), default=0))
              for i, h in enumerate(headers)]

    header_line = "  ".join(h.ljust(widths[i]) for i, h in enumerate(headers))
    sep_line = "  ".join("-" * w for w in widths)
    print(header_line)
    print(sep_line)
    for row in str_rows:
        parts = []
        for i, cell in enumerate(row):
            if alignments and alignments[i] == "right":
                parts.append(cell.rjust(widths[i]))
            else:
                parts.append(cell.ljust(widths[i]))
        print("  ".join(parts))


def cmd_sites(args):
    """List verified Search Console sites."""
    token = get_access_token()
    data = api_get("/webmasters/v3/sites", token)
    sites = data.get("siteEntry", [])
    if not sites:
        print("No sites found. Verify site ownership in Search Console.")
        return
    headers = ["Site URL", "Permission"]
    rows = [(s["siteUrl"], s["permissionLevel"]) for s in sites]
    format_table(headers, rows)


def build_query_body(args, dimensions=None, row_limit=None):
    """Build the searchAnalytics.query request body from args."""
    start, end = args.start_date, args.end_date
    if not start or not end:
        s, e = default_dates(getattr(args, "days", 28))
        start = start or s
        end = end or e

    body = {
        "startDate": start,
        "endDate": end,
        "rowLimit": row_limit or args.limit,
    }
    if dimensions:
        body["dimensions"] = dimensions
    if hasattr(args, "query_filter") and args.query_filter:
        body.setdefault("dimensionFilterGroups", [{"filters": []}])
        body["dimensionFilterGroups"][0]["filters"].append({
            "dimension": "query",
            "operator": "contains",
            "expression": args.query_filter,
        })
    if hasattr(args, "page_filter") and args.page_filter:
        body.setdefault("dimensionFilterGroups", [{"filters": []}])
        body["dimensionFilterGroups"][0]["filters"].append({
            "dimension": "page",
            "operator": "contains",
            "expression": args.page_filter,
        })
    if hasattr(args, "search_type") and args.search_type:
        body["type"] = args.search_type
    return body, start, end


def encode_site(site_url):
    """URL-encode the site URL for the API path."""
    return urllib.request.quote(site_url, safe="")


def cmd_query(args):
    """Run a custom search analytics query."""
    token = get_access_token()
    dims = [d.strip() for d in args.dimensions.split(",")] if args.dimensions else ["query"]
    body, start, end = build_query_body(args, dimensions=dims)
    site = encode_site(args.site_url)
    data = api_post(f"/webmasters/v3/sites/{site}/searchAnalytics/query", token, body)

    print(f"Period: {start} to {end}")
    print(f"Dimensions: {', '.join(dims)}\n")

    rows = data.get("rows", [])
    headers = dims + ["Clicks", "Impressions", "CTR", "Position"]
    table_rows = []
    for row in rows:
        keys = row.get("keys", [])
        table_rows.append(keys + [
            str(int(row["clicks"])),
            str(int(row["impressions"])),
            f"{row['ctr']:.1%}",
            f"{row['position']:.1f}",
        ])
    alignments = ["left"] * len(dims) + ["right", "right", "right", "right"]
    format_table(headers, table_rows, alignments)
    print(f"\n{len(rows)} rows returned.")


def cmd_top_queries(args):
    """Show top queries by clicks."""
    token = get_access_token()
    body, start, end = build_query_body(args, dimensions=["query"])
    site = encode_site(args.site_url)
    data = api_post(f"/webmasters/v3/sites/{site}/searchAnalytics/query", token, body)

    print(f"Top Queries: {start} to {end}\n")

    rows = sorted(data.get("rows", []), key=lambda r: r["clicks"], reverse=True)
    headers = ["Query", "Clicks", "Impressions", "CTR", "Position"]
    table_rows = []
    for row in rows:
        table_rows.append([
            row["keys"][0],
            str(int(row["clicks"])),
            str(int(row["impressions"])),
            f"{row['ctr']:.1%}",
            f"{row['position']:.1f}",
        ])
    format_table(headers, table_rows, ["left", "right", "right", "right", "right"])
    print(f"\n{len(rows)} queries.")


def cmd_top_pages(args):
    """Show top pages by clicks."""
    token = get_access_token()
    body, start, end = build_query_body(args, dimensions=["page"])
    site = encode_site(args.site_url)
    data = api_post(f"/webmasters/v3/sites/{site}/searchAnalytics/query", token, body)

    print(f"Top Pages: {start} to {end}\n")

    rows = sorted(data.get("rows", []), key=lambda r: r["clicks"], reverse=True)
    headers = ["Page", "Clicks", "Impressions", "CTR", "Position"]
    table_rows = []
    for row in rows:
        page = row["keys"][0].replace(args.site_url, "")
        table_rows.append([
            page or "/",
            str(int(row["clicks"])),
            str(int(row["impressions"])),
            f"{row['ctr']:.1%}",
            f"{row['position']:.1f}",
        ])
    format_table(headers, table_rows, ["left", "right", "right", "right", "right"])
    print(f"\n{len(rows)} pages.")


def cmd_compare(args):
    """Compare two date ranges (current vs previous period)."""
    token = get_access_token()
    days = args.days

    end_current = datetime.now() - timedelta(days=3)
    start_current = end_current - timedelta(days=days)
    end_prev = start_current - timedelta(days=1)
    start_prev = end_prev - timedelta(days=days)

    site = encode_site(args.site_url)

    body_current = {
        "startDate": start_current.strftime("%Y-%m-%d"),
        "endDate": end_current.strftime("%Y-%m-%d"),
        "dimensions": ["query"],
        "rowLimit": 500,
    }
    body_prev = {
        "startDate": start_prev.strftime("%Y-%m-%d"),
        "endDate": end_prev.strftime("%Y-%m-%d"),
        "dimensions": ["query"],
        "rowLimit": 500,
    }

    data_current = api_post(f"/webmasters/v3/sites/{site}/searchAnalytics/query", token, body_current)
    data_prev = api_post(f"/webmasters/v3/sites/{site}/searchAnalytics/query", token, body_prev)

    current_map = {r["keys"][0]: r for r in data_current.get("rows", [])}
    prev_map = {r["keys"][0]: r for r in data_prev.get("rows", [])}

    all_queries = set(current_map.keys()) | set(prev_map.keys())

    print(f"Comparison: {start_prev.strftime('%Y-%m-%d')} to {end_prev.strftime('%Y-%m-%d')}")
    print(f"        vs: {start_current.strftime('%Y-%m-%d')} to {end_current.strftime('%Y-%m-%d')}\n")

    results = []
    for q in all_queries:
        c = current_map.get(q, {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0})
        p = prev_map.get(q, {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0})
        click_delta = int(c["clicks"]) - int(p["clicks"])
        imp_delta = int(c["impressions"]) - int(p["impressions"])
        pos_delta = c["position"] - p["position"] if c["position"] and p["position"] else 0
        results.append((q, int(c["clicks"]), click_delta, int(c["impressions"]), imp_delta, c["position"], pos_delta))

    results.sort(key=lambda r: abs(r[2]), reverse=True)
    results = results[:args.limit]

    headers = ["Query", "Clicks", "Delta", "Impr", "Delta", "Pos", "Delta"]
    table_rows = []
    for r in results:
        cd = f"+{r[2]}" if r[2] > 0 else str(r[2])
        id_ = f"+{r[4]}" if r[4] > 0 else str(r[4])
        pd = f"{r[6]:+.1f}" if r[6] else "new"
        table_rows.append([r[0], str(r[1]), cd, str(r[3]), id_, f"{r[5]:.1f}" if r[5] else "-", pd])

    format_table(headers, table_rows, ["left", "right", "right", "right", "right", "right", "right"])
    print(f"\n{len(results)} queries with largest changes.")


def cmd_gaps(args):
    """Find content gaps: high impressions, low CTR, rankable position."""
    token = get_access_token()
    body, start, end = build_query_body(args, dimensions=["query"], row_limit=500)
    site = encode_site(args.site_url)
    data = api_post(f"/webmasters/v3/sites/{site}/searchAnalytics/query", token, body)

    print(f"Content Gaps: {start} to {end}")
    print(f"Criteria: impressions >= {args.min_impressions}, CTR < {args.max_ctr:.0%}, position <= {args.max_position}\n")

    rows = data.get("rows", [])
    gaps = []
    for row in rows:
        if (row["impressions"] >= args.min_impressions
                and row["ctr"] < args.max_ctr
                and row["position"] <= args.max_position):
            gaps.append(row)

    gaps.sort(key=lambda r: r["impressions"], reverse=True)
    gaps = gaps[:args.limit]

    headers = ["Query", "Impressions", "Clicks", "CTR", "Position", "Potential Clicks"]
    table_rows = []
    for row in gaps:
        # Potential: if CTR were average for position
        avg_ctr_for_pos = max(0.30 - (row["position"] - 1) * 0.03, 0.01)
        potential = int(row["impressions"] * avg_ctr_for_pos)
        table_rows.append([
            row["keys"][0],
            str(int(row["impressions"])),
            str(int(row["clicks"])),
            f"{row['ctr']:.1%}",
            f"{row['position']:.1f}",
            str(potential),
        ])
    format_table(headers, table_rows, ["left", "right", "right", "right", "right", "right"])
    print(f"\n{len(gaps)} gap opportunities found.")


def main():
    parser = argparse.ArgumentParser(description="Google Search Console CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    # sites
    sub.add_parser("sites", help="List verified sites")

    # Shared args for query commands
    def add_common_args(p, default_limit=25):
        p.add_argument("site_url", help="Site URL (e.g., https://getseam.app/)")
        p.add_argument("--start-date", "-s", help="Start date (YYYY-MM-DD)")
        p.add_argument("--end-date", "-e", help="End date (YYYY-MM-DD)")
        p.add_argument("--days", "-d", type=int, default=28, help="Days to look back (default: 28)")
        p.add_argument("--limit", "-l", type=int, default=default_limit, help=f"Row limit (default: {default_limit})")
        p.add_argument("--query-filter", "-q", help="Filter queries containing this string")
        p.add_argument("--page-filter", "-p", help="Filter pages containing this string")
        p.add_argument("--search-type", choices=["web", "image", "video", "news"], default="web")

    # query
    q = sub.add_parser("query", help="Custom search analytics query")
    add_common_args(q, default_limit=25)
    q.add_argument("--dimensions", help="Comma-separated dimensions (query,page,country,device,date)")

    # top-queries
    tq = sub.add_parser("top-queries", help="Top queries by clicks")
    add_common_args(tq, default_limit=50)

    # top-pages
    tp = sub.add_parser("top-pages", help="Top pages by clicks")
    add_common_args(tp, default_limit=50)

    # compare
    cp = sub.add_parser("compare", help="Compare current vs previous period")
    add_common_args(cp, default_limit=30)

    # gaps
    gp = sub.add_parser("gaps", help="Find content gap opportunities")
    add_common_args(gp, default_limit=50)
    gp.add_argument("--min-impressions", type=int, default=50, help="Minimum impressions (default: 50)")
    gp.add_argument("--max-ctr", type=float, default=0.03, help="Maximum CTR threshold (default: 0.03)")
    gp.add_argument("--max-position", type=float, default=20, help="Maximum position (default: 20)")

    args = parser.parse_args()

    commands = {
        "sites": cmd_sites,
        "query": cmd_query,
        "top-queries": cmd_top_queries,
        "top-pages": cmd_top_pages,
        "compare": cmd_compare,
        "gaps": cmd_gaps,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
