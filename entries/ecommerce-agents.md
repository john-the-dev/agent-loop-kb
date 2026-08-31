---
id: ecommerce-agents
title: "Production e-commerce agents"
url: https://www.agenticcommerce.dev/
category: evaluation
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "sources fetched live 2026-08-30: agenticcommerce.dev HTTP 200 'Agentic Commerce Protocol'; ftc.gov endorsement guides (regulator primary source)"
  - "the FTC citation is the strong half — a regulator's own guidance is the right authority for the disclosure claims, not a restatement of it"
  - "CAVEAT driving B not A: the protocol site is an emerging spec rather than established practice, so the operational claims rest on a standard that is still moving"
tags: [production, commerce, should, combine, lexical]
---

E-commerce agents should combine lexical and semantic product retrieval with hard filters for inventory, locale, compatibility, price, and fulfillment, and clearly label sponsored or personalized ranking. Recommendations must be grounded in catalog attributes and user-stated needs, not invented benefits; order tools require authenticated identity, exact totals, idempotency, and confirmation before purchase, cancellation, return, or address changes. A shopping agent can compare in-stock laptops against a budget and workload, then prepare a cart while the commerce service recomputes availability, tax, shipping, and the final charge.

## Deep dive

Two things make e-commerce agents different from general retrieval: **the catalog is ground truth and it changes hourly**, and **the recommendation is commercially interested**. Get either wrong and the failure is not a bad answer — it is an unfulfillable order or a disclosure problem.

## Retrieval: hybrid, then hard filters — in that order

Product search fails on pure semantics for a mundane reason: shoppers use exact tokens that embeddings blur. Model numbers, sizes, SKUs, and brand names need lexical matching; "something warm for a toddler in a rainy climate" needs semantic. Combine both.

Then apply **hard filters as constraints, not as ranking signals** — inventory, locale, compatibility, price band, fulfillment eligibility. This ordering is the whole design:

- A relevance score that *down-weights* out-of-stock items will still surface them when nothing else matches well. A filter removes them.
- Compatibility ("will this fit my model?") is a correctness property. A 0.82-similarity part that does not fit is not a near miss; it is wrong.
- Locale and fulfillment determine whether the item can be *bought by this shopper at all*. Recommending an unshippable product is a wasted session and a support ticket.

The reliable pattern is **retrieve broadly, filter hard, then rank** — with filters sourced from the live catalog rather than an embedding snapshot, because the index is always staler than inventory.

## Grounding: recommend from attributes, never from memory

Every claim in a recommendation — dimensions, materials, compatibility, price, availability — must come from a catalog field, not from the model's parametric knowledge of the product category. Models are fluent about product classes and confidently wrong about specific SKUs, and a fabricated spec becomes a return, a chargeback, or a misrepresentation claim.

Two habits make this enforceable rather than aspirational: emit recommendations as **structured references to catalog ids** with prose assembled from retrieved fields, and treat any attribute the catalog does not carry as unavailable — the agent says it does not know rather than inferring from the product name.

## Disclosure: know what actually triggers it

The governing framework is the FTC's [Endorsement Guides](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking), last updated June 2023, built on the **material connection** standard: any relationship that might affect how a consumer weighs a recommendation must be disclosed. The practical test is "would it matter?" — if knowing about the arrangement would change how a reasonable consumer evaluates the recommendation, disclose it.

**A nuance worth getting right, because it cuts against the intuitive reading:** the FTC has *not* required that all product placements be disclosed. Its position is that advertisers do not generally use placement to make objective claims, so failing to label a placement is not inherently deceptive. Disclosure becomes necessary when objective claims are made and consumers would be confused about whether the claim comes from the advertiser or an independent source.

That nuance does not rescue agent-driven ranking, and the distinction is the point: **when a commercial relationship drives the recommendation itself, you are squarely in scope.** An agent that ranks sponsored inventory higher, or earns a commission on what it recommends, is making the exact kind of interested recommendation the material-connection standard exists for. Label it clearly and conspicuously, before the recommendation rather than beneath it, and label *each* relationship where several stack — a generic "contains affiliate links" notice does not cover a paid placement sitting alongside it.

**On penalties: I am deliberately not quoting a per-violation figure here.** The circulating numbers disagree with each other and trace to marketing blogs rather than primary material. Civil penalty amounts are adjusted annually and should be read from the FTC's own published adjustments. The FTC has separately sought public input on modernizing its ".com Disclosures" guidance for multi-party e-commerce arrangements, so this area is moving.

## Personalization has a floor

Ground personalization in **user-stated needs** — what they said in this session, what they actually bought — rather than inferred sensitive traits. Inferring health conditions, financial distress, pregnancy, or protected characteristics from browsing behavior and then acting on it is a legal and reputational exposure that the incremental conversion does not pay for.

## What to instrument

Filter-violation rate (recommended items that were unbuyable), attribute-hallucination rate against catalog ground truth, disclosure-coverage on every sponsored surface, return rate on agent-recommended items versus baseline, and the gap between offered and fulfilled. The last one is the honest measure of whether retrieval and the catalog have drifted apart.

*Related: [production sales and GTM agents](/library/sales-agents), [customer support agents](/library/customer-support-agents), [rag basics](/library/rag-basics), [retrieval quality](/library/retrieval-quality).*
