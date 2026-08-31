#!/usr/bin/env python3
"""Scan a ClickUp workspace for tasks that stopped moving and rule on each one.

Read-only by default. `--apply delete` is the only writing mode and it only ever
adds a tag; nothing in this file deletes a task.

  python3 scan.py                      # full report
  python3 scan.py --space MARKETING    # one space
  python3 scan.py --verdict delete     # one verdict
  python3 scan.py --json out.json      # machine-readable
  python3 scan.py --apply delete       # add the 🗑️ delete tag to every delete verdict
"""

import argparse
import collections
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

WORKSPACE_FILE = os.environ.get("CU_TRIAGE_WORKSPACE") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "workspace.json"
)
# The workspace map is data, not code: ids, space names and the class of every list.
# `workspace.example.json` is the shape. Point CU_TRIAGE_WORKSPACE at your own copy,
# or drop it beside this file as workspace.json.
if not os.path.exists(WORKSPACE_FILE):
    _internal = os.path.join(os.path.dirname(WORKSPACE_FILE), "workspace.internal.json")
    WORKSPACE_FILE = _internal if os.path.exists(_internal) else WORKSPACE_FILE
try:
    WORKSPACE = json.load(open(WORKSPACE_FILE))
except FileNotFoundError:
    sys.exit(
        f"no workspace map at {WORKSPACE_FILE}. Copy workspace.example.json, fill in "
        f"your ids, and save it as workspace.json or point CU_TRIAGE_WORKSPACE at it."
    )

TEAM = os.environ.get("CU_TEAM_ID") or WORKSPACE["team"]
DELETE_TAG = "\U0001f5d1\ufe0f delete"
TAG_FG = "#ffffff"
TAG_BG = "#e74c3c"
# Applying the tag destroys the evidence (ClickUp bumps date_updated), so the age
# and the reason are written here before the write.
LEDGER = WORKSPACE["ledger"]
# Any bulk edit by anyone resets date_updated, so the oldest age ever observed for a
# task is kept here and carried forward while its body and status stay unchanged.
SEEN = WORKSPACE["seen"]
# The token that owns manage_tags. A member token 401s on a space-tag write.
WRITE_TOKEN = WORKSPACE.get("write_token", "owner")

SPACES = WORKSPACE["spaces"]

# List class decides whether a list can be triaged at all.
#   registry -> records, not work. Age carries no meaning. Never triaged.
#   archive  -> deliberately parked. Only empty shells under a finished parent are ruled on.
#   board    -> live work. Full triage.
# Anything absent lands in `unclassified` and is reported, never tagged.
LIST_CLASS = WORKSPACE["list_class"]

# Every list inside these folders is an archive: the client or the audit is over.
ARCHIVE_FOLDERS = set(WORKSPACE.get("archive_folders", []))

# Days without an update before a task counts as stopped.
STALE = {"board": 90, "content": 180, "archive": 90}
# Days before a task carrying real content should be closed rather than left open.
ABANDONED = 180


def load_tokens():
    path = os.path.expanduser("~/.config/clickup/config.json")
    cfg = json.load(open(path))
    return {t["name"]: t["token"] for t in cfg["tokens"]}


def read_ledger(path):
    """Last recorded entry per task id."""
    out = {}
    if not os.path.exists(path):
        return out
    with open(path) as fh:
        for line in fh:
            line = line.strip()
            if line:
                row = json.loads(line)
                out[row["id"]] = row
    return out


def read_seen(path):
    """Oldest age ever observed per task, with the body and status it had then."""
    out = {}
    if not os.path.exists(path):
        return out
    with open(path) as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            prev = out.get(r["id"])
            if not prev or r["days_still"] > prev["days_still"]:
                out[r["id"]] = r
    return out


def append_seen(path, rows, stamp):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "a") as fh:
        for r in rows:
            fh.write(
                json.dumps(
                    {
                        "id": r["id"],
                        "days_still": r["days_still"],
                        "body": r["body"],
                        "status": r["status"],
                        "seen_at": stamp,
                    }
                )
                + "\n"
            )


def append_ledger(path, rows, stamp):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "a") as fh:
        for r in rows:
            fh.write(json.dumps({**r, "applied_at": stamp}, ensure_ascii=False) + "\n")


def api(path, token, params=None, method="GET"):
    url = f"https://api.clickup.com/api/v2/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={"Authorization": token}, method=method)
    return json.load(urllib.request.urlopen(req))


def post(path, token, body):
    url = f"https://api.clickup.com/api/v2/{path}"
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Authorization": token, "Content-Type": "application/json"},
        method="POST",
    )
    return json.load(urllib.request.urlopen(req))


def fetch_tasks(token):
    """Every non-closed task in the workspace, plus the parents of any subtask.

    The team endpoint returns lists shared with the token even when GET /space on
    their space would 401, so this is the one call that sees GROWTH and ACADEMY.

    Paging the closed tasks too would triple the runtime, so closed parents are
    resolved one by one instead: only their status is needed, to tell an orphan
    shell from a live one.
    """
    out = {}
    for page in range(0, 60):
        d = api(
            f"team/{TEAM}/task",
            token,
            {"page": page, "subtasks": "true", "include_closed": "false"},
        )
        got = d.get("tasks", [])
        for t in got:
            out[t["id"]] = t
        if d.get("last_page") or not got:
            break
    missing = {t["parent"] for t in out.values() if t.get("parent")} - set(out)
    for pid in missing:
        try:
            out[pid] = api(f"task/{pid}", token)
        except urllib.error.HTTPError:
            pass  # parent deleted or out of reach: treated as unknown, never as finished
    return out


def list_class(task):
    cls = LIST_CLASS.get(task["list"]["id"])
    if cls:
        return cls
    if (task.get("folder") or {}).get("name") in ARCHIVE_FOLDERS:
        return "archive"
    return "unclassified"


def is_empty(t):
    """No information would be lost by removing this task.

    assignees, time_estimate, points and start_date are deliberately NOT substance.
    A task template stamps all four on every subtask it creates, so counting them
    splits identical sibling shells: on 17 Aug 2026 three of the four Bachgold
    onboarding shells were flagged and the fourth spared, only because that one
    carried the template's default 3h estimate; 30 of the Blog's "Validate copy"
    shells hid in the review bucket only because the template named an assignee.
    An assignee with no due date and no description after 90 days is a nomination,
    not ownership. The `revive` verdict is what catches real ownership, and it
    requires an assignee AND a due date.
    """
    return not any(
        [
            (t.get("text_content") or "").strip(),
            t.get("due_date"),
            t.get("priority"),
            [x for x in t.get("tags") or [] if x["name"] != DELETE_TAG],
            t.get("checklists"),
            t.get("dependencies"),
            t.get("linked_tasks"),
        ]
    )


def rule(t, tasks, now, ledger, seen):
    """Return (verdict, confidence, reason, days, body) for one live task."""
    days = (now - int(t["date_updated"])) / 86400000
    body = len((t.get("text_content") or "").strip())

    # A bulk tag, rename or status sweep bumps date_updated without anyone doing the
    # work, which hid 21 real close candidates on 17 Aug 2026. If this task was seen
    # older before, and neither its body nor its status has moved since, that older
    # reading is the true one.
    prior = seen.get(t["id"])
    carried = bool(
        prior
        and prior["days_still"] > days
        and prior["body"] == body
        and prior["status"] == t["status"]["status"]
    )
    if carried:
        days = prior["days_still"]

    r = _rule(t, tasks, now, ledger, days, body)
    if not r:
        return None
    verdict, conf, reason = r
    if carried:
        reason += f" [age carried from {int(days)}d: only metadata changed since]"
    return (verdict, conf, reason, int(days), body)


def _rule(t, tasks, now, ledger, days, body):
    cls = list_class(t)

    if cls == "registry":
        return None

    # Adding the tag bumps date_updated, so a tagged task reads as touched today
    # and would silently drop out of every later report. Catch it before the age
    # gate and recover its real age from the ledger.
    if any(x["name"] == DELETE_TAG for x in t.get("tags") or []):
        past = ledger.get(t["id"])
        note = f"was {past['days_still']}d still: {past['reason']}" if past else "age lost, not in the ledger"
        return ("tagged", "n/a", f"already marked {DELETE_TAG}, waiting on a human pass ({note})")
    if cls == "unclassified":
        return ("unclassified", "n/a", "list has no class in LIST_CLASS; classify it before triaging")
    if days < STALE[cls]:
        return None

    parent = tasks.get(t.get("parent") or "")
    parent_done = bool(parent) and parent["status"]["type"] in ("closed", "done")
    empty = is_empty(t)

    if empty:
        named = ", ".join(a["username"] for a in t.get("assignees") or [])
        who = f" (nominally {named})" if named else ""
        if parent_done:
            return ("delete", "high", f"empty subtask left under a finished parent, {int(days)}d still{who}")
        if days >= ABANDONED:
            return ("delete", "high", f"empty task nobody filled in, {int(days)}d still{who}")
        if t.get("parent"):
            return ("delete", "medium", f"empty subtask under a parent that is itself stopped, {int(days)}d{who}")
        return ("delete", "medium", f"empty task with no description or date, {int(days)}d still{who}")

    if cls == "archive":
        return ("leave", "n/a", f"parked list, carries content, {int(days)}d")

    if t.get("assignees") and t.get("due_date"):
        return ("revive", "n/a", f"owned and dated but untouched {int(days)}d: needs a new date, not a tag")

    if days >= ABANDONED and body >= 400:
        return ("close", "n/a", f"{body} chars of real content sitting open {int(days)}d: move to a terminal status")

    if body == 0:
        # Name the one field that spared it, or the report reads as an undifferentiated dump.
        if t.get("dependencies"):
            held = "wired into a dependency chain, so removing it rewires a sibling"
        elif t.get("linked_tasks"):
            held = "linked from another task"
        elif t.get("due_date"):
            held = f"carries a due date {int((now - int(t['due_date'])) / 86400000)}d past"
        elif t.get("checklists"):
            held = "carries a checklist"
        elif t.get("tags"):
            held = "tagged " + ", ".join(x["name"] for x in t["tags"])
        else:
            held = "priority set"
        return ("review", "n/a", f"empty shell {int(days)}d still but {held}: delete or unwire")

    return ("review", "n/a", f"{int(days)}d still, {body} chars, no owner: decide")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--space", help="filter to one space name, e.g. MARKETING")
    ap.add_argument("--verdict", help="filter to one verdict")
    ap.add_argument("--json", dest="jsonout", help="write findings to this path")
    ap.add_argument("--apply", choices=["delete"], help="add the delete tag to every delete verdict")
    ap.add_argument("--min-confidence", default="medium", choices=["high", "medium"])
    ap.add_argument("--ledger", default=LEDGER, help="where applied tags are recorded")
    ap.add_argument("--seen", default=SEEN, help="where observed ages are recorded")
    args = ap.parse_args()

    tokens = load_tokens()
    read_token = next(iter(tokens.values()))
    now = int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)
    ledger = read_ledger(args.ledger)
    seen = read_seen(args.seen)

    tasks = fetch_tasks(read_token)
    findings = []
    for t in tasks.values():
        if t["status"]["type"] in ("closed", "done"):
            continue
        r = rule(t, tasks, now, ledger, seen)
        if not r:
            continue
        verdict, conf, reason, days, body = r
        space = SPACES.get(t["space"]["id"], t["space"]["id"])
        if args.space and space != args.space.upper():
            continue
        if args.verdict and verdict != args.verdict:
            continue
        findings.append(
            {
                "id": t["id"],
                "name": t["name"],
                "url": t["url"],
                "space": space,
                "space_id": t["space"]["id"],
                "list": t["list"].get("name"),
                "list_id": t["list"]["id"],
                "status": t["status"]["status"],
                "days_still": days,
                "body": body,
                "verdict": verdict,
                "confidence": conf,
                "reason": reason,
            }
        )

    findings.sort(key=lambda f: (f["verdict"], -f["days_still"]))

    # Record what this run saw, so a later bulk edit cannot erase these ages.
    # Only findings are recorded: a task under the stale threshold has no age worth
    # preserving yet, which does leave an 89-day task vulnerable to a metadata bump.
    if not args.space and not args.verdict:
        append_seen(
            args.seen,
            [f for f in findings if f["verdict"] != "tagged"],
            datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        )

    counts = collections.Counter(f["verdict"] for f in findings)
    print(f"live tasks scanned: {sum(1 for t in tasks.values() if t['status']['type'] not in ('closed', 'done'))}")
    print("verdicts: " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items())) or "none")
    print()
    for verdict in ("delete", "tagged", "close", "revive", "review", "leave", "unclassified"):
        rows = [f for f in findings if f["verdict"] == verdict]
        if not rows:
            continue
        print(f"--- {verdict} ({len(rows)}) ---")
        for f in rows:
            conf = f" [{f['confidence']}]" if f["confidence"] != "n/a" else ""
            print(f"  {f['id']}  {f['days_still']:4}d  {f['space']:10} {str(f['list'])[:24]:24} {f['name'][:48]:48}{conf}")
            print(f"             {f['reason']}")
        print()

    if args.jsonout:
        json.dump(findings, open(args.jsonout, "w"), indent=1, ensure_ascii=False)
        print(f"wrote {args.jsonout}")

    if args.apply == "delete":
        allowed = ("high",) if args.min_confidence == "high" else ("high", "medium")
        targets = [f for f in findings if f["verdict"] == "delete" and f["confidence"] in allowed]
        if not targets:
            print("nothing to tag")
            return
        # Write the ledger BEFORE the tag: the tag write bumps date_updated and the
        # original age becomes unrecoverable.
        stamp = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
        append_ledger(args.ledger, targets, stamp)
        print(f"recorded {len(targets)} rows in {args.ledger}")
        # Creating a space tag needs manage_tags, which a member token does not carry.
        write_token = tokens.get(WRITE_TOKEN, read_token)
        for space_id in sorted({f["space_id"] for f in targets}):
            try:
                post(f"space/{space_id}/tag", write_token, {"tag": {"name": DELETE_TAG, "tag_fg": TAG_FG, "tag_bg": TAG_BG}})
                print(f"created {DELETE_TAG} in space {space_id}")
            except urllib.error.HTTPError as e:
                body = e.read().decode()
                if "already exists" in body or e.code == 400:
                    print(f"{DELETE_TAG} already in space {space_id}")
                else:
                    print(f"space {space_id}: {e.code} {body}", file=sys.stderr)
        ok = 0
        for f in targets:
            try:
                api(f"task/{f['id']}/tag/{urllib.parse.quote(DELETE_TAG)}", write_token, method="POST")
                ok += 1
            except urllib.error.HTTPError as e:
                print(f"{f['id']}: {e.code} {e.read().decode()}", file=sys.stderr)
        print(f"tagged {ok}/{len(targets)}")
        # Read the tag back rather than trusting the write.
        verified = 0
        for f in targets:
            t = api(f"task/{f['id']}", write_token)
            if any(x["name"] == DELETE_TAG for x in t.get("tags", [])):
                verified += 1
        print(f"verified {verified}/{len(targets)} carry {DELETE_TAG}")


if __name__ == "__main__":
    main()
