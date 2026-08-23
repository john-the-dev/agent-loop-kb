---
id: healthcare-agents
title: "Production agents in healthcare"
url: https://www.hhs.gov/hipaa/for-professionals/security/index.html
category: general
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, healthcare, handling, protected, health]
---

Healthcare agents handling protected health information require HIPAA-aligned administrative, physical, and technical safeguards, minimum-necessary data access, vendor agreements where applicable, audit logs, and verified identity boundaries. Ground clinical statements in approved, current sources with citations, display uncertainty, and require qualified human review for diagnosis, treatment, triage, or any action that could affect care. A visit-summary agent can draft patient instructions from the signed note and formulary data, but a clinician must review the draft and unsupported details must be omitted rather than guessed.

## Deep dive

**Start with a correction, because most 2026 guidance gets it backwards:** HIPAA does *not* currently require multi-factor authentication or encryption of ePHI. Both are **"addressable"** implementation specifications under the [Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) — meaning you implement them, implement an equivalent alternative, or document why neither is reasonable and appropriate for your environment.

The rule that *would* make them required is a **proposed** rule, published in the Federal Register on 6 January 2025. It has not been finalized. OCR's own timetable slipped from May 2026, and OMB's regulatory agenda now shows a final rule delayed to **July 2027**. More than 100 hospital systems and provider associations — including the American Medical Association — have formally asked HHS to withdraw it, largely over HHS's own ~$9 billion year-one cost projection.

So an agent vendor telling a hospital "HIPAA now mandates MFA" is wrong on the law. **And a builder who concludes "therefore it's optional" is wrong on the risk**, which is the more expensive error.

## Why the gap between the rule and the enforcement matters

The current Security Rule was adopted in 2003 and has been largely unchanged since. It predates cloud computing, telehealth at scale, ransomware-as-a-business, and every LLM you might deploy. The proposed update is not inventing new expectations — it is largely codifying what OCR *already* enforces through settlements, where the recurring findings are failures of risk analysis, inadequate access controls, and missing encryption.

The practical posture that survives both outcomes: **build to the proposed requirements, document your decisions under the current addressable framework.** If the rule finalizes you are already compliant; if it is withdrawn you have documentation that satisfies the standard that actually exists.

## What the safeguards mean for an agent specifically

HIPAA organizes controls as administrative, physical, and technical. Agents stress two of them in unusual ways:

**Minimum necessary.** The standard asks you to limit PHI to what is needed for the purpose. An agent's context window is the opposite instinct — retrieval wants to pull *everything* plausibly relevant, because recall improves answers. Those goals are in direct conflict, and the conflict has to be resolved in the retrieval layer, not in the prompt. Filter on identity and purpose *before* documents become context; a system prompt asking the model to ignore irrelevant PHI is not an access control.

**Audit controls.** You must be able to reconstruct who accessed what. For an agent this means logging the *retrieval*, not just the conversation: which records were pulled into context, under whose authority, and what the agent did with them. A transcript alone cannot answer an OCR inquiry, and it is also the artifact most teams discover they never captured.

## Business associates are in scope, and that includes you

If you build an agent that touches PHI on a covered entity's behalf, you are a business associate. That requires a **business associate agreement**, and it flows down: your model provider, your vector database, and your observability vendor are all subcontractors handling PHI if PHI reaches them. Two consequences builders routinely miss:

- **Trace and prompt logging is PHI storage.** An observability tool capturing full prompts is holding clinical data in a system nobody scoped as clinical.
- **A model API that retains inputs for training is a disclosure.** Whether your provider offers a zero-retention path is a compliance question, not a procurement preference.

## Grounding is a safety control, not a quality feature

Clinical statements must be grounded in approved sources — formularies, order sets, institutional protocols — and cite them. This is not the same problem as general RAG quality. A plausible-but-unsourced dosing statement is not a slightly worse answer; it is a patient-safety event wearing the costume of a helpful one.

Design so that the *absence* of a grounded source produces a refusal and a handoff, never a synthesized answer. And keep the human in the loop where the decision is clinical: an agent that drafts, summarizes, and assembles evidence is a different regulatory and safety object than one that recommends treatment.

## What to build first

Identity boundaries verified before retrieval; purpose-scoped access rather than role-scoped alone; retrieval-level audit logging; BAAs covering every subcontractor that can see PHI including observability; zero-retention model endpoints; grounded-or-refuse behavior on clinical claims; and encryption plus MFA implemented now on the strength of the risk, with your addressable-specification reasoning written down either way.
