---
name: seo-analytics-tracking
description: When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "conversion tracking," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," or "tracking plan." For A/B test measurement, see ab-test-setup.
metadata:
  version: "1.0.0"
tags: [makes, seo, analytics]
---

# Analytics Tracking

Set up tracking that provides specific insights for marketing and product decisions.

## What to establish before instrumenting
If `.claude/product-marketing-context.md` exists, read first.

1. **Business context**. what decisions will this data inform? Key conversions? Key actions to track?
2. **Current state**. what tracking exists? What tools?
3. **Technical context**. tech stack, privacy/compliance requirements
4. **Implementer**. dev or marketing?

## Core Principles

- **Track for decisions, not data**. every event informs a decision, avoid vanity metrics, quality > quantity
- **Start with questions**. what do you need to know? What actions will you take? Work backwards.
- **Name consistently**. establish patterns before implementing, document everything
- **Maintain data quality**. validate implementation, monitor issues, clean > more

## Tracking Plan Framework

```
Event Name | Category | Properties | Trigger | Notes
```

**Event types:** pageviews (automatic + metadata), user actions (clicks, submissions, feature usage), system events (signup, purchase, subscription changes), custom conversions (goals, funnel stages).

See [references/event-library.md](references/event-library.md).

## Event Naming

**Format: object-action**
```
signup_completed
button_clicked
form_submitted
article_read
checkout_payment_completed
```

**Practices:** lowercase with underscores · specific (`cta_hero_clicked` not `button_clicked`) · context in properties not names · no spaces/special chars · document decisions.

## Essential Events

**Marketing site:**

| Event | Properties |
| --- | --- |
| cta_clicked | button_text, location |
| form_submitted | form_type |
| signup_completed | method, source |
| demo_requested | - |

**Product/App:**

| Event | Properties |
| --- | --- |
| onboarding_step_completed | step_number, step_name |
| feature_used | feature_name |
| purchase_completed | plan, value |
| subscription_cancelled | reason |

## Event Properties

| Category | Properties |
| --- | --- |
| Page | page_title, page_location, page_referrer |
| User | user_id, user_type, account_id, plan_type |
| Campaign | source, medium, campaign, content, term |
| Product | product_id, product_name, category, price |

**Practices:** consistent names · relevant context · don't duplicate automatic properties · no PII.

## GA4 Implementation

**Setup:** create property + data stream → install gtag.js or GTM → turn on enhanced measurement → configure custom events → mark conversions in Admin.

```javascript
gtag("event", "signup_completed", {
  method: "email",
  plan: "free",
});
```

See [references/ga4-implementation.md](references/ga4-implementation.md).

## Google Tag Manager

**Container:** Tags (code that executes: GA4, pixels) · Triggers (when tags fire: page view, click) · Variables (dynamic values: click text, data layer).

**Data layer:**
```javascript
dataLayer.push({
  event: "form_submitted",
  form_name: "contact",
  form_location: "footer",
});
```

See [references/gtm-implementation.md](references/gtm-implementation.md).

## UTM Parameters

| Parameter | Purpose | Example |
| --- | --- | --- |
| utm_source | Traffic source | google, newsletter |
| utm_medium | Medium | cpc, email, social |
| utm_campaign | Campaign name | spring_sale |
| utm_content | Differentiate versions | hero_cta |
| utm_term | Paid search keywords | running+shoes |

**Naming:** lowercase · consistent underscores/hyphens · specific but concise (`blog_footer_cta` not `cta1`) · document all UTMs in a spreadsheet.

## Debugging & Validation

**Tools:** GA4 DebugView (real-time monitoring) · GTM Preview Mode (test before publish) · browser extensions (Tag Assistant, dataLayer Inspector).

**Validation:**
- [ ] Events fire on correct triggers
- [ ] Properties populate correctly
- [ ] No duplicate events
- [ ] Works across browsers and mobile
- [ ] Conversions recorded
- [ ] No PII leaking

**Common issues:** events not firing (check trigger config, GTM loaded) · wrong values (variable path, data layer structure) · duplicates (multiple containers, trigger firing twice).

## Privacy & Compliance

Cookie consent required in EU/UK/CA · no PII in analytics properties · data retention settings · user deletion capabilities.

**Implementation:** consent mode (wait for consent) · IP anonymization · collect only what you need · integrate with consent management platform.

## Output Format

```markdown
# [Site/Product] Tracking Plan

## What each report answers
- Tools: GA4, GTM
- Last updated: [Date]

## Events
| Event Name | Description | Properties | Trigger |
| --- | --- | --- | --- |
| signup_completed | User completes signup | method, plan | Success page |

## Custom Dimensions
| Name | Scope | Parameter |
| --- | --- | --- |
| user_type | User | user_type |

## Conversions
| Conversion | Event | Counting |
| --- | --- | --- |
| Signup | signup_completed | Once per session |
```

## Tool Integrations

**GA4** (web analytics, Google stack; MCP ✓) · **Mixpanel** (product analytics) · **Amplitude** (cohort analysis) · **PostHog** (open-source, session replay) · **Segment** (CDP, routing).

## Related Skills

- **ab-test-setup**. experiment tracking
- **seo-audit**. organic traffic analysis
- **landing-page-cro**. conversion optimization (uses this data)
