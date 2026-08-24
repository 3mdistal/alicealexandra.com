# Agent Readiness Brief

Status: replacement scope approved for Work  
Date: 2026-08-24  
Governing repository: `3mdistal/alicealexandra.com`

## Return-to-Shape Revision (2026-08-24)

`WORK PAUSED — RETURNING TO SHAPE`

Alice clarified during Work: "i don't wanna add any human-visible things in this run." This conflicts with the frozen first slice, which included no-JavaScript homepage prose, a new human-readable 404 body, and new Contact and Privacy pages. Implementation stopped before any production file was changed.

### Material delta

Old fingerprint:

- Outcome included at least 500 meaningful characters in raw homepage HTML.
- Shipping behavior included new human-readable homepage fallback prose, 404 recovery content, Contact, and Privacy pages.
- Acceptance assertions H1, H3, and H7 required those human-facing additions.

Proposed replacement fingerprint:

- Outcome is limited to machine-oriented discovery, identity, and representation surfaces that do not alter the ordinary browser-rendered interface.
- Keep: homepage `Accept: text/markdown` negotiation; `Vary: Accept`; correct q-value/`406` behavior; `/sitemap.xml`; `/llms.txt`; canonical metadata; language/Open Graph corrections; accurate Person JSON-LD; automated and deployed-preview verification.
- Defer: additional homepage prose, custom human-facing 404 content, Contact page, Privacy page, Organization schema, brand-search work, and sitewide Markdown negotiation.
- Preserve the existing HTML homepage body and existing HTML 404 rendering. A Markdown-preferred request may receive machine-oriented Markdown, but the normal HTML representation must remain visually and textually unchanged.

### Options

1. **Machine-only slice (recommended):** accept that the audit's raw-HTML prose, trust-page, and agent-friendly HTML 404 checks remain partial/failed; ship only protocol, discovery, and metadata improvements.
2. **Hidden prose:** add visually hidden or crawler-targeted text to chase the raw-HTML score. Rejected because it would burden assistive technology or resemble cloaking.
3. **Visible fallback/UI prose:** retain the original story. Rejected by Alice's stated constraint.

### Replacement acceptance story

Successful-user story: A source-blind agent can request a clean Markdown representation of the unchanged homepage, discover canonical public URLs and when-to-use guidance, and resolve Alice/Tempo Immaterial programmatically, while ordinary human-facing HTML content and visuals remain unchanged.

Required assertions:

1. Default or HTML-preferred `GET /` returns the same human-facing HTML body structure and text as the baseline; no new visible page prose, page, navigation item, or human-facing error content is introduced.
2. Markdown-preferred `GET /` returns clean `text/markdown; charset=utf-8`; both negotiated variants include `Vary: Accept`; q-values, wildcards, explicit `q=0`, HEAD, and unsatisfiable Accept cases follow the published protocol.
3. Existing unknown paths continue returning HTTP 404 with unchanged HTML behavior; no custom human-facing recovery UI is added.
4. `/sitemap.xml` is valid XML and lists only intended canonical/indexable URLs, with evidence-based `lastmod` where available.
5. `/llms.txt` contains accurate when-to-use guidance, canonical links, and no unsupported capability claims.
6. Homepage canonical, language, Open Graph fields, and valid Person-oriented JSON-LD are present and use the canonical host without adding visible content.
7. Unit, type, lint, build, and relevant end-to-end regression checks pass.
8. An exact draft-PR preview proves the header/body/machine-file assertions and confirms the ordinary browser homepage is visually unchanged; production is rechecked during Land.

Acceptance policy remains schema v3: real-interface modality, preferred independence, same-context-allowed custody, HTTP and browser verification on the exact Vercel preview. Risk strategy remains system-ready with production validation after merge.

Approval: Alice approved this replacement fingerprint and acceptance story in the calling task on 2026-08-24. Work resumes under ledger `agent-readiness-work-v2`.

## Summary

Improve how reliably web agents can identify, read, navigate, and attribute alicealexandra.com without turning the personal creative studio into a corporate marketing site. The first slice should fix the audit failures that are both technically demonstrable and aligned with the site's product vision: meaningful no-JavaScript homepage content, recoverable 404s, a sitemap and agent guide, correct canonical/identity metadata, and standards-compliant Markdown negotiation on the homepage.

The audit score is an input, not the specification. Live inspection on 2026-08-24 showed that the homepage already server-renders an H1 and navigation, and unknown paths already return HTTP 404. Their actual gaps are sparse homepage prose and an unhelpful error body. The audit also recommends Organization schema with a postal address and phone, but this is a personal creative site; publishing invented or private business details would reduce trust rather than improve it.

## Context

alicealexandra.com is Alice's personal studio and portfolio. Its primary audience remains curious visitors, friends, and fans, followed by collaborators and recruiters. Agents are a new access constituency: they should be able to understand and accurately represent the same public work, not receive a different product or marketing identity.

Direct evidence:

- `docs/product/vision.md` prioritizes an unmistakably Alice, accessible, privacy-respecting studio over a conventional SaaS presentation.
- `src/routes/+page.svelte` and `src/lib/homepage/site-title.svelte` produce server-rendered homepage markup, including the H1, but very little explanatory prose.
- The production homepage returns HTML for `Accept: text/markdown` and does not send `Vary: Accept`.
- A production unknown route returns HTTP 404 with only `404 / Not Found` in the body.
- No `/sitemap.xml`, `/llms.txt`, `/contact`, or `/privacy` implementation is present in the repository.
- Existing content loaders already expose source Markdown for major authored collections, while several content-heavy routes are statically prerendered.

## Problem or Opportunity

An agent can discover route labels but cannot confidently answer what Tempo Immaterial is, when to use the site, where its canonical identity lives, or how to recover from a bad URL. HTML-only delivery also forces Markdown-preferring clients to consume layout and application markup. Search engines lack an explicit canonical URL, sitemap, and structured personal identity.

The opportunity is to add a thin machine-readable layer that reflects the human site instead of redesigning it.

## Desired Outcome

After this slice:

1. A no-JavaScript client receives an H1 and at least 500 meaningful characters describing Tempo Immaterial, Alice, and the site's principal sections in the raw homepage HTML, without changing the existing visual composition for ordinary JavaScript-enabled visitors.
2. The homepage serves either HTML or clean Markdown from the same canonical URL according to the request's `Accept` preferences, with correct `Content-Type`, `Vary: Accept`, q-value handling, and `406` behavior when neither supported representation is acceptable.
3. Unknown public paths remain true 404s and offer concise recovery links to the homepage, sitemap, and agent guide.
4. `/sitemap.xml`, `/llms.txt`, `/contact`, and `/privacy` exist, are useful and accurate, and are linked or discoverable where appropriate.
5. The homepage declares its canonical URL and Person-oriented JSON-LD for Alice/Tempo Immaterial without exposing invented, private, or inapplicable business details.
6. Existing visual behavior, navigation, accessibility, authored content, owner-only APIs, and human-facing HTML responses do not regress.

## Options

### A. Implement every audit recommendation literally

This could optimize for the current score, but it would misdiagnose the SSR and 404 behavior, treat a personal site as an organization, invite publication of address/phone data, and conflate external search ranking with a repository change.

### B. Ship a grounded first slice focused on public discovery and the homepage (recommended)

Correct the demonstrated homepage and recovery gaps, add accurate personal identity and machine files, and implement the complete Markdown negotiation contract on the homepage. This maximizes immediate value while keeping the protocol boundary testable.

### C. Add sitewide Markdown negotiation in the first slice

This is attractive, but the site mixes runtime Svelte pages, prerendered collection pages, source Markdown, JSON-backed views, and interactive studio experiences. A sitewide representation system needs a separate inventory and a decision about source-derived versus HTML-derived Markdown. Folding it into this score-remediation slice would hide unresolved product and caching questions.

## Recommended Direction

Choose Option B.

- Add substantive no-JavaScript homepage copy as a progressive fallback that describes the same site and links to the same sections. It must not be keyword stuffing or crawler-only claims.
- Implement homepage content negotiation through an explicit server-owned representation boundary, backed by a small, tested Accept parser. Follow RFC 9110 selection semantics and the acceptmarkdown.com contract: `text/markdown; charset=utf-8`, `Vary: Accept`, HTML fallback when allowed, and `406` only when no supported representation is acceptable.
- Add a custom SvelteKit error page whose public 404 rendering preserves the status and provides recovery links. Do not expose internal error details.
- Generate a valid XML sitemap from the known public route inventory and content metadata, excluding owner routes, auth/API routes, unsubscribe flows, and non-indexable experimental surfaces unless explicitly classified public.
- Add `/llms.txt` with a concise description, a specific "When to use this site" section, canonical high-value links, and limitations. It should guide agents toward Alice's public creative work, biography, career writing, blog, and studio—not advertise an API or transactional service that does not exist.
- Add canonical metadata and `Person` JSON-LD on the homepage, using only already-public identity links and facts. Model Tempo Immaterial as Alice's site/creative studio within that graph rather than claiming a registered Organization.
- Add honest Contact and Privacy pages in the site's existing voice and chrome. Contact may point to already-public contact channels; it must not resurrect the demo form as a functioning submission path. Privacy must describe actual data behavior, including owner-auth cookies where relevant, and must not promise practices the implementation cannot prove.
- Record brand-name search visibility as an external follow-up, not acceptance for this code slice.

## Constraints

- Preserve the visual design and interaction model; machine readiness must be additive.
- Preserve the canonical host already used by production redirects: `https://www.alicealexandra.com/`.
- Do not publish a home address, phone number, private email, fabricated contact point, or legal organization identity.
- Do not add analytics, tracking, agent actions, an MCP server, an agent API, or a new content-management system.
- Do not claim full-site Markdown negotiation in this slice.
- Keep `/owner`, authentication, content-editing APIs, and other non-public surfaces out of sitemaps and agent guidance.
- Use the existing SvelteKit/Vercel deployment architecture and existing content loaders where they are already the source of truth.

## Risks and Assumptions

- The audit may award points mechanically for 500 characters or Organization fields. Passing those heuristics is secondary to accurate, accessible content.
- Vercel caching must be verified on the deployed preview; origin headers alone do not prove variant safety.
- A no-JavaScript fallback that is hidden from ordinary visitors is acceptable only if it is a truthful alternative rendering, remains accessible when active, and is not used to conceal unrelated SEO text.
- Public contact details and external identity URLs must be derived from facts already published in the repository/site. Any new address or private contact channel requires Alice's separate decision.
- `lastmod` values must come from content/repository metadata that exists; they must not be generated as "today" on every build.

## Open Questions

None blocks this first slice. Work may use only already-public contact and identity facts. If that produces an inadequate Contact page, the page should clearly offer the available public channels and record the missing preferred contact method as a product follow-up rather than inventing one.

The broader question—whether every indexable page should negotiate Markdown—is intentionally deferred to a second Shape pass after the first slice establishes a representation pattern and inventories prerendered surfaces.

## Next Steps

Under `/work`:

1. Inspect the exact current public route/content inventory and classify indexable versus excluded URLs.
2. Implement the smallest compatible homepage negotiation boundary and machine files.
3. Add the no-JavaScript homepage fallback, custom 404, metadata, Contact, and Privacy pages using existing design primitives.
4. Add unit tests for Accept selection, sitemap/llms/schema output, and error behavior; add browser tests for human-facing homepage, Contact, Privacy, and 404 behavior.
5. Build and test locally, then verify the exact draft-PR preview with HTML, Markdown, unsupported Accept, sitemap, llms, 404, metadata, and no-JavaScript requests.
6. Report brand search visibility and any genuinely missing public contact fact as recommendations, not implementation failures.

## Architecture Grounding and Fit

Applicability: required, because content negotiation changes a public HTTP contract and crosses SvelteKit rendering, prerendering, and Vercel caching boundaries.  
Status: grounded for the homepage-only first slice.

- Demonstrated caller: a web agent requests `GET /` with `Accept: text/markdown`; a no-JavaScript crawler requests `GET /`; an agent follows a nonexistent public URL and needs a recoverable 404.
- Existing primitives: SvelteKit server hooks (`src/hooks.server.ts`), Svelte page/head rendering, local Markdown/content loaders, explicit prerender flags, Vercel deployment, and current product chrome.
- Ownership boundaries: SvelteKit owns application representations and status bodies; Vercel owns edge delivery/cache behavior; the private content repository owns authored collection content; public search engines own ranking.
- Legacy contracts: browsers continue receiving the current HTML and visual interaction; public route meanings stay stable; unknown routes stay 404; owner/auth/API behavior is unchanged.
- Shared vocabulary: "agents" means source-blind web clients/crawlers consuming public pages; "Markdown negotiation" means an alternate representation of the same canonical resource, not a separate agent product.
- Smallest compatible delta: negotiate only the homepage in this slice; add machine files and recovery/identity pages using normal SvelteKit routes.
- Deferred capabilities: full-site Markdown negotiation, Markdown for interactive studio pieces, external brand/SEO campaigns, transactional agent actions, and organization/business schema.
- Reversibility: the additions are route-local or a bounded homepage request branch; no schema, credentials, or content migration is involved.
- Direct evidence: the production response checks and repository paths listed in Context; the published acceptmarkdown.com guidance requiring preference-aware selection, matching content type, `Vary: Accept`, and correct `406` behavior.
- Inference: Vercel preview behavior should match production sufficiently to prove the implementation before merge; Land must still recheck the durable destination.
- Unresolved owner questions affecting a shared contract: none for this slice.

## Acceptance Story

Successful-user story: A source-blind agent or crawler can identify Alice and Tempo Immaterial, obtain a concise representation of the homepage, discover public content, and recover from a bad path, while a human visitor sees the same existing site behavior and Alice's private information remains private.

Required assertions:

1. Raw homepage HTML contains one H1 and at least 500 meaningful characters of truthful site description/navigation without executing JavaScript.
2. `GET /` with HTML-preferred/default Accept returns the existing human-facing HTML; Markdown-preferred Accept returns clean Markdown; both variants include `Vary: Accept`; q-values, wildcards, explicit `q=0`, HEAD, and unsatisfiable Accept cases behave consistently with the published protocol.
3. A nonexistent public path returns 404 in both relevant representations and includes recovery links without leaking internals.
4. `/sitemap.xml` is valid XML, lists only intended canonical/indexable URLs, includes evidence-based `lastmod` values where available, and all listed URLs resolve successfully on the exact preview.
5. `/llms.txt` is plain text/Markdown, includes specific when-to-use guidance and canonical links, and makes no unsupported capability claims.
6. Homepage canonical, language, Open Graph fields, and valid Person-oriented JSON-LD are present and use the canonical host.
7. `/about`, `/contact`, and `/privacy` resolve as human-readable, accessible pages; Contact uses only public channels and Privacy matches observed site behavior.
8. Automated unit, type, lint, build, and end-to-end checks pass, including regression checks for existing homepage navigation/design behavior.
9. An exact draft-PR preview demonstrates all public endpoint/header/body assertions; the production destination is rechecked after merge before the result is called shipped.

Acceptance policy:

- Modality: real-interface
- Independence: preferred
- Custody: same-context-allowed
- Interface: command-line HTTP requests against the exact Vercel preview plus Playwright against the rendered preview; production HTTP recheck during Land
- Rationale: cache headers, status codes, content negotiation, and no-JavaScript output require a deployed HTTP boundary. Independent review adds confidence but does not warrant tester-owned custody for this low-risk, reversible public-content change.

Risk strategy: system-ready. No feature flag is needed because the slice is additive, reversible, and can be fully exercised on an exact branch preview before merge; production is rechecked only to confirm delivery of the already-proven behavior.

## Architecture Fingerprint

```yaml
authoritySchemaVersion: 3
stage: shape
ledger-revision: agent-readiness-shape-v1
authority-source: 'Alice invoked $shape on the pasted agent-readiness implementation request.'
allowed-mutations: [artifact-write]
governing-artifact:
  path: docs/product/AGENT_READINESS_BRIEF.md
  revision: agent-readiness-shape-v1
outcome: "Public agents can accurately identify, read, navigate, and attribute the site's homepage and machine-discovery surfaces without changing the human product identity."
shipping-surfaces:
  - id: public-web-agent-readiness
    repository: 3mdistal/alicealexandra.com
    product-surface: alicealexandra.com public web application and Vercel delivery
    constituency: human visitors and source-blind public web agents/crawlers
    durable-destination: production main branch deployed at https://www.alicealexandra.com/
    integration-action: merge
governing-architecture: 'Use bounded SvelteKit-owned public routes and a homepage-only representation boundary, preserving existing HTML behavior and treating Vercel as the delivery/cache boundary.'
acceptance-story:
  id: public-agent-readiness-v1
  summary: 'Agents can identify, read, discover, and recover across the bounded public surfaces while humans retain the existing experience and private facts stay private.'
  required-assertions: [H1-H9 in Acceptance Story]
  acceptance-policy:
    modality: real-interface
    independence: preferred
    custody: same-context-allowed
    interface: exact Vercel preview via HTTP and Playwright, followed by production HTTP recheck during Land
    rationale: 'The meaningful risks are deployed representation and cache behavior; preview-bound real-interface evidence is proportional and same-context custody is sufficient.'
risk-strategy:
  kind: system-ready
  production-validation-after-merge: true
architecture-grounding:
  applicability: required
  status: grounded
  reason: 'The slice changes a public HTTP representation contract across SvelteKit and Vercel caching.'
delegation-ceiling: []
acceptance-state:
  status: pending
  summary: 'Implementation and exact-preview evidence have not begun; Shape authorizes only this brief.'
  blockers: []
status: active
task-attention: shape-complete
```
