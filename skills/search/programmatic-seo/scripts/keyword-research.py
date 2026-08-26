#!/usr/bin/env python3
"""
Keyword Research Tool using Serper.dev API

Expands seed keywords into related keywords using:
- Google Autocomplete suggestions
- Related searches
- People Also Ask questions

Usage:
    python keyword-research.py --seed "mac notch app"
    python keyword-research.py -s "dynamic island mac" -o keywords.json
    python keyword-research.py -s "macbook productivity" --depth 2

Environment:
    SERPER_API_KEY - Your Serper.dev API key (get free at https://serper.dev)
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


SERPER_API_KEY = os.environ.get("SERPER_API_KEY")
SERPER_BASE_URL = "https://google.serper.dev"


def serper_request(endpoint: str, payload: dict) -> dict:
    """Make a request to the Serper.dev API."""
    if not SERPER_API_KEY:
        print("Error: SERPER_API_KEY environment variable not set")
        print("Get your free API key at https://serper.dev")
        sys.exit(1)

    url = f"{SERPER_BASE_URL}/{endpoint}"
    data = json.dumps(payload).encode("utf-8")

    req = Request(url, data=data, method="POST")
    req.add_header("X-API-KEY", SERPER_API_KEY)
    req.add_header("Content-Type", "application/json")

    try:
        with urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        print(f"API Error: {e.code} - {e.reason}")
        if e.code == 401:
            print("Invalid API key. Check your SERPER_API_KEY.")
        sys.exit(1)
    except URLError as e:
        print(f"Network Error: {e.reason}")
        sys.exit(1)


def get_autocomplete(query: str, country: str = "us") -> list[str]:
    """Get Google Autocomplete suggestions for a query."""
    payload = {"q": query, "gl": country}
    result = serper_request("autocomplete", payload)
    suggestions = result.get("suggestions", [])
    # Extract 'value' from each suggestion object
    return [s.get("value", s) if isinstance(s, dict) else s for s in suggestions]


def get_related_searches(query: str, country: str = "us") -> list[str]:
    """Get related searches from Google SERP."""
    payload = {"q": query, "gl": country, "num": 10}
    result = serper_request("search", payload)

    related = []
    for item in result.get("relatedSearches", []):
        if isinstance(item, dict) and "query" in item:
            related.append(item["query"])
        elif isinstance(item, str):
            related.append(item)

    return related


def get_people_also_ask(query: str, country: str = "us") -> list[dict]:
    """Get People Also Ask questions from Google SERP."""
    payload = {"q": query, "gl": country, "num": 10}
    result = serper_request("search", payload)

    paa = []
    for item in result.get("peopleAlsoAsk", []):
        if isinstance(item, dict):
            paa.append({
                "question": item.get("question", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("link", ""),
            })

    return paa


def expand_keyword(seed: str, depth: int = 1, country: str = "us") -> dict:
    """
    Expand a seed keyword into related variations.

    Args:
        seed: The seed keyword to expand
        depth: How many levels of expansion (1-3)
        country: Country code for localized results
    """
    print(f"\n🔍 Researching: {seed}")

    expanded = {
        "seed": seed,
        "timestamp": datetime.now().isoformat(),
        "country": country,
        "autocomplete": [],
        "related_searches": [],
        "people_also_ask": [],
        "expanded_keywords": set(),
    }

    # Level 1: Direct expansion
    print("  → Getting autocomplete suggestions...")
    autocomplete = get_autocomplete(seed, country)
    expanded["autocomplete"] = autocomplete
    expanded["expanded_keywords"].update(autocomplete)

    print("  → Getting related searches...")
    related = get_related_searches(seed, country)
    expanded["related_searches"] = related
    expanded["expanded_keywords"].update(related)

    print("  → Getting People Also Ask...")
    paa = get_people_also_ask(seed, country)
    expanded["people_also_ask"] = paa

    # Level 2+: Recursive expansion on top autocomplete results
    if depth >= 2 and autocomplete:
        print(f"\n  📊 Depth 2: Expanding top {min(3, len(autocomplete))} suggestions...")
        for suggestion in autocomplete[:3]:
            sub_autocomplete = get_autocomplete(suggestion, country)
            expanded["expanded_keywords"].update(sub_autocomplete)
            sub_related = get_related_searches(suggestion, country)
            expanded["expanded_keywords"].update(sub_related)

    if depth >= 3 and related:
        print(f"\n  📊 Depth 3: Expanding top {min(2, len(related))} related searches...")
        for rel in related[:2]:
            sub_autocomplete = get_autocomplete(rel, country)
            expanded["expanded_keywords"].update(sub_autocomplete)

    # Convert set to sorted list
    expanded["expanded_keywords"] = sorted(expanded["expanded_keywords"])

    return expanded


def generate_content_brief(keyword_data: dict) -> str:
    """Generate a content brief from keyword research."""
    seed = keyword_data["seed"]
    questions = [q["question"] for q in keyword_data["people_also_ask"][:5]]

    brief = f"""# Content Brief: {seed.title()}

## Target Keyword
- **Primary**: {seed}
- **Search Intent**: [transactional/informational/navigational]

## Autocomplete Suggestions (High Search Intent)
{chr(10).join(f"- {kw}" for kw in keyword_data["autocomplete"][:10])}

## Related Searches
{chr(10).join(f"- {kw}" for kw in keyword_data["related_searches"][:10])}

## Questions to Answer (FAQ Section)
{chr(10).join(f"- {q}" for q in questions) if questions else "- No PAA questions found"}

## All Expanded Keywords ({len(keyword_data["expanded_keywords"])} total)
{chr(10).join(f"- {kw}" for kw in keyword_data["expanded_keywords"][:30])}

## Content Requirements
- **Word Count**: 1,500-2,500 words
- **H1**: Include "{seed}" naturally
- **Meta Title**: Under 60 characters, keyword near front
- **Meta Description**: 150-160 characters, compelling CTA

## Outline Suggestions
1. Introduction (what is {seed})
2. Why you need it (benefits)
3. Top options compared
4. How to choose
5. FAQ section
6. Conclusion with CTA

---
Generated: {keyword_data["timestamp"]}
Country: {keyword_data["country"]}
"""
    return brief


def main():
    parser = argparse.ArgumentParser(
        description="Keyword research using Serper.dev API"
    )
    parser.add_argument(
        "-s", "--seed",
        required=True,
        help="Seed keyword to expand"
    )
    parser.add_argument(
        "-o", "--output",
        type=Path,
        help="Output JSON file (optional)"
    )
    parser.add_argument(
        "--brief",
        action="store_true",
        help="Also generate a content brief markdown file"
    )
    parser.add_argument(
        "--depth",
        type=int,
        default=1,
        choices=[1, 2, 3],
        help="Expansion depth (1-3). Higher = more keywords, more API calls"
    )
    parser.add_argument(
        "--country",
        default="us",
        help="Country code for localized results (default: us)"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("SERPER.DEV KEYWORD RESEARCH")
    print("=" * 60)

    # Expand the keyword
    keyword_data = expand_keyword(args.seed, args.depth, args.country)

    # Display results
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)

    print(f"\n📝 Seed: {keyword_data['seed']}")

    print(f"\n🔤 Autocomplete ({len(keyword_data['autocomplete'])} suggestions):")
    for kw in keyword_data["autocomplete"][:10]:
        print(f"  • {kw}")

    print(f"\n🔗 Related Searches ({len(keyword_data['related_searches'])}):")
    for kw in keyword_data["related_searches"][:10]:
        print(f"  • {kw}")

    print(f"\n❓ People Also Ask ({len(keyword_data['people_also_ask'])}):")
    for paa in keyword_data["people_also_ask"][:5]:
        print(f"  • {paa['question']}")

    print(f"\n📊 Total Unique Keywords: {len(keyword_data['expanded_keywords'])}")

    # Save to JSON if output specified
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        # Convert set to list for JSON serialization
        output_data = {**keyword_data}
        args.output.write_text(json.dumps(output_data, indent=2))
        print(f"\n✅ Saved JSON to: {args.output}")

    # Generate content brief if requested
    if args.brief:
        brief = generate_content_brief(keyword_data)
        brief_filename = f"brief-{keyword_data['seed'].replace(' ', '-').lower()}.md"
        brief_path = Path(brief_filename)
        brief_path.write_text(brief)
        print(f"✅ Content brief saved to: {brief_path}")

    print("\n" + "=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print(f"""
1. Review the expanded keywords above
2. Pick high-intent keywords for articles
3. Generate content brief with --brief flag
4. Run article generator:
   python generate-article.py -k "{args.seed}" -t "Your Title"

API Credits Used: ~{1 + (3 if args.depth >= 2 else 0) + (2 if args.depth >= 3 else 0)} requests
""")


if __name__ == "__main__":
    main()
