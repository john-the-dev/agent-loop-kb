---
id: legal-agents
title: "Production agents for legal work"
url: https://hai.stanford.edu/news/hallucinating-law-legal-mistakes-large-language-models-are-pervasive
category: memory
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, legal, work, should, retrieve]
---

Legal agents should retrieve from authoritative, jurisdiction- and date-filtered corpora and preserve court, reporter, docket, pinpoint citation, precedential status, and source text for every proposition. Validate that cited authorities exist and support the claim, distinguish law from argument, disclose incomplete coverage, and require attorney review before filing, advising a client, or changing contractual rights. For a motion-research use case, the agent can assemble a claim-to-authority table and quote short verified passages, while a reviewer checks negative treatment and final reasoning.

## Deep dive

The defining fact about AI in legal practice is not that models hallucinate citations. It is that **courts have now built a public record of what happens when a lawyer files one**, and that record says something more specific than "be careful."

## The numbers, and why they disagree

Published trackers report materially different totals — roughly 1,148, 1,313, 1,490, and 1,598 cases depending on which you read and when it was checked. **The spread is not sloppiness; it is population.** Some count every party including pro se litigants, others only licensed attorneys. Some are worldwide, others US-only. Some count court *decisions*, others count *proceedings*, others count individual *attorneys*.

Quote a number without naming its population and you have reproduced the exact error the topic is about. Note also that several trackers are published by vendors selling citation-verification tools; the underlying database most of them draw on is maintained by legal researcher Damien Charlotin. **Pull the underlying order before relying on any listed case.**

What is not in dispute is the direction: the counts are rising fast, and one federal appellate court has observed the problem shows no sign of abating.

## The sanctions escalated, and the reason is instructive

The baseline is *Mata v. Avianca* (S.D.N.Y. 2023) — six nonexistent decisions produced by ChatGPT, $5,000 against the lawyers and their firm. By 2026 the ceiling had moved by more than an order of magnitude: **$110,204.38 in *Couvrette v. Wisnovsky* (D. Or.)**, across orders in December 2025 and March 2026, involving 15 nonexistent cases and 8 fabricated quotations. In Q1 2026 alone US courts imposed at least $145,000 in sanctions for fabricated citations.

License consequences exist too, and their pattern is the important part. Colorado suspended a lawyer for two years in 2023; the Nebraska Supreme Court entered an interim suspension in April 2026 against a lawyer whose February 2026 brief had **57 of 63 citations defective** and who, asked whether he had used AI, first denied it and then admitted it.

**In both, the license consequence followed a candor failure layered on the fabrication — not the AI use alone.** Across the corpus the same shape repeats: *the cover-up draws a harsher penalty than the hallucination.* Courts have also declined to sanction where counsel explained candidly; in one Eastern District of California matter the show-cause order was discharged after the court accepted the explanation.

## The engineering conclusion

Every one of these cases reduces to a single act: **a lawyer signed a citation they had not read.** The tool that produced it never mattered to the court, which is why "we used a legal-specific model" is not a defense and not a design.

So the system requirement is not a better model. It is that **no citation reaches a filing without having been resolved against an authoritative database**, mechanically, with the failure surfaced rather than smoothed. Concretely:

1. **Resolve, don't check.** Confirm the case exists *and* that the cited proposition appears at the pinpoint. A citation can be real and still not say what the brief claims — a failure mode that verifying existence alone will never catch.
2. **Preserve the source text** for every proposition, so a reviewer compares against the actual passage rather than re-reading the model's summary of it.
3. **Filter the corpus by jurisdiction and date before retrieval**, not after. An on-point case from the wrong jurisdiction, or one that has been overruled, is a different kind of wrong from a fabricated one and is harder to spot precisely because it is real.
4. **Carry precedential status as a first-class field** — published vs unpublished, binding vs persuasive, and subsequent history. "Good law" is not a property of the text; it is a property of the citation's current posture.
5. **Fail loudly.** An unresolvable citation must block, not degrade into a footnote. The whole failure mode is a system that produces confident output when it should produce a stop.

## Where agents genuinely help

Nothing above argues against agents in legal work — it argues against unverified generation. The durable value is in the labor that is checkable by construction: retrieving and summarizing authorities *with* their source text attached, surfacing contradictory authority, extracting obligations and dates from long agreements with pinpoint provenance, and flagging where a draft's support is thin. Each of those makes a lawyer faster at work they still verify, which is the only posture the sanctions record rewards.

*Related: [does the EU AI Act apply to your agent?](/library/eu-ai-act-agents).*
