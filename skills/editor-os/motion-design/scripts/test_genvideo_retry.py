#!/usr/bin/env python3
"""Prove genvideo.py retries and falls back the way the app's video lanes do.

usage: python3 test_genvideo_retry.py

The TypeScript suite (video.test.ts) holds the same cases; a number changed in one file and not
the other fails here or there. No network: urlopen and sleep are replaced.
"""
import io, json, os, sys, unittest, urllib.error
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import genvideo as G


def http_error(code, retry_after=None):
    headers = {"Retry-After": retry_after} if retry_after else {}
    return urllib.error.HTTPError("https://x", code, "err", headers, io.BytesIO(b"{}"))


class Reply:
    def __init__(self, body):
        self.body = json.dumps(body).encode()

    def read(self, *_):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False


def fresh(name="agnes"):
    G._lane.update(name=name, waited=0.0, retries=0, posted=False)
    G._starts.clear()


class Backoff(unittest.TestCase):
    def test_retry_after_reads_seconds_and_dates(self):
        self.assertEqual(G.parse_retry_after("30"), 30.0)
        self.assertEqual(G.parse_retry_after("Wed, 08 Oct 2026 12:00:30 GMT", now=1791460800.0), 30.0)
        self.assertIsNone(G.parse_retry_after("soon"))
        self.assertIsNone(G.parse_retry_after(None))

    def test_waits_start_at_5s_and_60s_and_double(self):
        zero = lambda: 0.0
        self.assertEqual([G.backoff(n, 503, None, zero) for n in (1, 2, 3)], [5.0, 10.0, 20.0])
        self.assertEqual([G.backoff(n, 429, None, zero) for n in (1, 2, 3)], [60.0, 120.0, 120.0])

    def test_retry_after_is_a_floor_and_jitter_only_stretches(self):
        zero = lambda: 0.0
        self.assertEqual(G.backoff(1, 429, 2.0, zero), 60.0)
        self.assertEqual(G.backoff(1, 503, 45.0, zero), 45.0)
        self.assertAlmostEqual(G.backoff(1, 503, None, lambda: 0.8), 6.0)


class Retry(unittest.TestCase):
    def test_503_then_success(self):
        fresh()
        sleeps = []
        calls = [http_error(503), http_error(503), "ok"]

        def send():
            r = calls.pop(0)
            if isinstance(r, Exception):
                raise r
            return r

        out = G.with_retry(send, sleep=sleeps.append, rand=lambda: 0.0)
        self.assertEqual(out, "ok")
        self.assertEqual(sleeps, [5.0, 10.0])
        self.assertEqual(G._lane["retries"], 2)

    def test_429_with_retry_after_waits_at_least_that_long(self):
        fresh()
        sleeps = []
        calls = [http_error(429, "90"), "ok"]

        def send():
            r = calls.pop(0)
            if isinstance(r, Exception):
                raise r
            return r

        G.with_retry(send, sleep=sleeps.append, rand=lambda: 0.0)
        self.assertEqual(sleeps, [90.0])

    def test_429_with_no_header_waits_a_minute(self):
        fresh()
        sleeps = []
        calls = [http_error(429), "ok"]
        G.with_retry(lambda: (_ for _ in ()).throw(calls.pop(0)) if len(calls) == 2 else "ok",
                     sleep=sleeps.append, rand=lambda: 0.0)
        self.assertEqual(sleeps, [60.0])

    def test_a_dropped_connection_is_retried(self):
        fresh()
        calls = [urllib.error.URLError("reset"), "ok"]

        def send():
            r = calls.pop(0)
            if isinstance(r, Exception):
                raise r
            return r

        self.assertEqual(G.with_retry(send, sleep=lambda s: None, rand=lambda: 0.0), "ok")

    def test_a_400_is_not_retried(self):
        fresh()
        with self.assertRaises(urllib.error.HTTPError):
            G.with_retry(lambda: (_ for _ in ()).throw(http_error(400)), sleep=lambda s: None)

    def test_a_retry_after_past_the_budget_ends_the_lane_at_once(self):
        fresh()
        sleeps = []
        with self.assertRaisesRegex(G.Exhausted, "would pass the 240s budget"):
            G.with_retry(lambda: (_ for _ in ()).throw(http_error(429, "600")), sleep=sleeps.append)
        self.assertEqual(sleeps, [])

    def test_four_tries_then_exhausted(self):
        fresh()
        n = []

        def send():
            n.append(1)
            raise http_error(503)

        with self.assertRaises(G.Exhausted):
            G.with_retry(send, sleep=lambda s: None, rand=lambda: 0.0)
        self.assertEqual(len(n), 4)

    def test_a_poll_that_keeps_failing_after_the_task_exists_never_falls_back(self):
        fresh()
        G._lane["posted"] = True
        with mock.patch.object(G.urllib.request, "urlopen", side_effect=http_error(503)), \
                mock.patch.object(G.time, "sleep"):
            with self.assertRaisesRegex(SystemExit, "may still complete"):
                G.request_json("https://x/poll")

    def test_the_sixth_creation_of_a_minute_waits(self):
        fresh()
        sleeps = []
        clock = lambda: 1000.0
        for _ in range(G.STARTS_PER_MINUTE):
            G.take_start_slot(sleep=sleeps.append, now=clock)
        self.assertEqual(sleeps, [])
        G.take_start_slot(sleep=sleeps.append, now=clock)
        self.assertEqual(sleeps, [60.0])


class Fallback(unittest.TestCase):
    def lanes(self, **fns):
        return mock.patch.dict(G.LANES, fns)

    def run_serve(self, chain, max_cost=None, seconds=6):
        with mock.patch.object(G, "env_key", return_value="k"):
            return G.serve(chain, max_cost, seconds, "p", "16:9", None, None)

    def test_falls_to_the_named_lane_and_says_so(self):
        def spent(*a):
            raise G.Exhausted("HTTP 503 on all 4 tries")

        with self.lanes(agnes=spent, **{"agnes-paid": lambda *a: ("https://cdn/clip.mp4", {})}):
            lane, seconds, uri, _, log = self.run_serve(["agnes", "agnes-paid"])
        self.assertEqual((lane, seconds, uri), ("agnes-paid", 6, "https://cdn/clip.mp4"))
        self.assertIn("agnes exhausted", log[0])
        self.assertIn("agnes-paid served", log[1])
        self.assertAlmostEqual(G.LIST_PRICE[lane] * seconds, 0.24)

    def test_a_paid_lane_nobody_named_is_never_called(self):
        paid = mock.Mock()

        def spent(*a):
            raise G.Exhausted("HTTP 503 on all 4 tries")

        with self.lanes(agnes=spent, **{"agnes-paid": paid}):
            with self.assertRaisesRegex(SystemExit, "every video lane failed"):
                self.run_serve(["agnes"])
        paid.assert_not_called()

    def test_a_lane_over_the_cap_is_skipped(self):
        def spent(*a):
            raise G.Exhausted("HTTP 503 on all 4 tries")

        paid = mock.Mock()
        with self.lanes(agnes=spent, **{"agnes-paid": paid}):
            with self.assertRaisesRegex(SystemExit, r"over the \$0.10 cap"):
                self.run_serve(["agnes", "agnes-paid"], max_cost=0.10)
        paid.assert_not_called()


def refused(code, message):
    return urllib.error.HTTPError("https://x", code, "err", {}, io.BytesIO(json.dumps({"message": message}).encode()))


class SpentLane(unittest.TestCase):
    """An empty quota or balance is a spent lane: no retry, no wait, on to the next lane."""

    def create(self, error):
        fresh()
        sleeps = []
        with mock.patch.object(G.urllib.request, "urlopen", side_effect=error), \
                mock.patch.object(G.time, "sleep", sleeps.append):
            with self.assertRaises(G.Exhausted) as caught:
                G.request_json("https://x/v1/videos", {"model": "m"})
        self.assertEqual(sleeps, [])
        return str(caught.exception)

    def test_an_empty_quota_403_is_spent(self):
        self.assertIn("quota", self.create(refused(403, "Insufficient user quota, remaining: $0.000000")))

    def test_a_402_is_spent(self):
        self.assertIn("402", self.create(refused(402, "video requires a minimum balance of $10")))

    def test_a_plain_403_still_raises(self):
        fresh()
        with mock.patch.object(G.urllib.request, "urlopen", side_effect=refused(403, "model not allowed for this key")):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                G.request_json("https://x/v1/videos", {"model": "m"})
        self.assertIn("model not allowed", caught.exception.read().decode())


class Ledger(unittest.TestCase):
    def test_a_task_is_kept_before_the_first_poll_and_resume_collects_it_without_a_new_one(self):
        import pathlib, tempfile
        path = pathlib.Path(tempfile.mkdtemp()) / "genvideo-jobs.jsonl"
        fresh()
        G._ledger.update(path=str(path), prompt="a secret prompt", mp4="out/clip.mp4", price=0.0, seconds=5)
        with mock.patch.object(G.urllib.request, "urlopen", return_value=Reply({"video_id": "vid_1"})):
            G.request_json("https://x/v1/videos", {"model": "m"})
        row = json.loads(path.read_text())
        self.assertEqual((row["lane"], row["reply"]["video_id"], row["seconds"]), ("agnes", "vid_1", 5))
        self.assertNotIn("secret", path.read_text())
        self.assertRegex(row["prompt_hash"], r"^[0-9a-f]{16}$")

        done = Reply({"status": "completed", "url": "https://cdn/clip.mp4"})
        with mock.patch.object(G, "env_key", return_value="k"), \
                mock.patch.object(G.urllib.request, "urlopen", return_value=done) as opened, \
                mock.patch.object(G.time, "sleep"):
            lane, seconds, uri, _, log = G.resume("vid_1", str(path))
        self.assertEqual((lane, seconds, uri), ("agnes", 5, "https://cdn/clip.mp4"))
        self.assertEqual(opened.call_count, 1)
        self.assertIn("video_id=vid_1", opened.call_args[0][0].full_url)
        self.assertIn("resumed job vid_1", log[0])
        G._ledger.update(path=None)

    def test_an_unknown_job_says_which_ledger_it_looked_in(self):
        with self.assertRaisesRegex(SystemExit, "No job nope"):
            G.resume("nope", "/nonexistent/genvideo-jobs.jsonl")


if __name__ == "__main__":
    unittest.main()
