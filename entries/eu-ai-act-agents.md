---
id: eu-ai-act-agents
title: "Does the EU AI Act apply to my AI agent?"
url: https://artificialintelligenceact.eu/article/50/
category: security
source_type: docs
status: current
grade: A
added: 2026-08-21
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Article 50: Transparency Obligations for Providers and Deployers of Certain AI Systems'"
  - "primary legislative text, not a commentary on it. The entry is about disclosure duties for agent systems and Article 50 is the provision that creates them — claim and evidence are the same instrument"
tags: [eu-ai-act, article-50, compliance, transparency, disclosure, regulation, deepfakes, gpai]
---
Article 50 of the EU AI Act has been enforceable since 2 August 2026 and applies to agents regardless of high-risk status — the Annex III high-risk regime was separately deferred to 2 December 2027. Agents that interact with people must disclose they are AI; generated content must be machine-readable marked. Providers AND deployers are covered, open-source is not exempt, and the rules are extraterritorial. Penalties reach EUR 15 million or 3% of worldwide turnover, whichever is higher.

## Deep dive

**Short answer:** if your agent talks to people in the EU, or its output is used there, **Article 50 of the EU AI Act has applied to you since 2 August 2026** — and it applies whether or not your system is "high-risk". The single most common mistake right now is conflating the two: the Annex III high-risk regime was deferred to **2 December 2027**, but Article 50 was deliberately left out of that deferral and is enforceable today.

**What Article 50 actually requires.** It covers four disclosure situations:

1. **Direct interaction** — a system that interacts with a person must be designed so the person is informed they are dealing with an AI. This is the one that catches most agents: a support agent, a sales agent, or a voice agent must say what it is.
2. **AI-generated content** — synthetic audio, image, video or text must be marked in a machine-readable way.
3. **Emotion recognition and biometric categorisation** — subjects must be told the system is in use.
4. **Deep fakes and AI-generated public-interest text** — deployers must disclose.

**It is not limited to model builders.** Providers *and deployers* both carry duties. A company running a third-party chatbot on its own site is a deployer and has obligations even though it built none of the model. Free and open-source licensed systems are **not** exempt from Article 50.

**It is extraterritorial.** The Act reaches providers, deployers, importers and distributors who place AI on the EU market *or whose AI output is used in the EU*. A US-only company whose agent answers an EU user is in scope.

**The penalties arrived with the obligation.** Article 99 (Member-State penalties) and Article 101 (Commission fines on GPAI providers) became operative on the same date. For breaches of operator obligations such as Article 50, the ceiling is **€15 million or 3% of worldwide annual turnover, whichever is higher**. There is no grace period on enforcement powers — the duty and the power to fine landed together.

**Two carve-outs worth knowing, because they are narrow.** Generative systems already on the market before the May 2026 provisional agreement have until **2 December 2026** to meet the machine-readable marking duty in Article 50(2) — that extension covers marking only, not the disclosure duty for interactive systems. And deepfake content created before 2 August 2026 carries no retroactive labelling obligation.

**What to actually do, in order.**

- **Disclose in the first turn.** Put the AI disclosure in the agent's opening message or persistent UI, not buried in a terms page. The requirement is that the person *is informed*, which a footer does not achieve.
- **Mark generated artifacts** in a machine-readable form — the Commission confirmed the Code of Practice on Transparency of AI-Generated Content as an adequate route.
- **Write down which role you are.** Provider and deployer duties differ; most teams are deployers and assume they are neither.
- **Check the output path, not the company address.** Scope follows where the output is used.

The Commission published final Article 50 guidelines on 20 July 2026; read those before building your own interpretation.
