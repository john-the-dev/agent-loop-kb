---
id: groundedness-hallucination
title: "Groundedness: measuring and detecting agent hallucination"
url: https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/groundedness
category: evaluation
source_type: docs
status: current
grade: B
added: 2026-08-23
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, title 'Groundedness detection in Azure AI Content Safety - Azure AI services | Microsoft Learn'"
  - "unusually close method match: the entry describes decomposing an answer into atomic claims and checking each against the source with an entailment model, which is what the cited service does. CAVEAT driving B not A: it is still one vendor's detector, so the entry's general claim rests on a single implementation"
  - "NEGATIVE CONTROL for this batch: learn.microsoft.com returns 404 on a fabricated path (/azure/search/not-a-real-page-xyz), so the 200s above are real pages and not a docs catch-all route, checked 2026-08-30"
tags: [evaluation, hallucination, groundedness, faithfulness, rag, nli, observability]
---

Groundedness measures whether each claim in an agent's output is entailed by the source material the agent actually saw, and it is computed by decomposing the answer into atomic claims and checking each one against that source with an entailment model or an LLM judge. It is not the same thing as correctness: an answer can be perfectly grounded in a retrieved passage that is itself wrong, so groundedness scores the generation step only and must be paired with retrieval metrics. For agents the source is not a single passage but the union of tool results, prior turns, and memory in that run, which is why an ungrounded claim at step two silently becomes the premise for step five.

## Deep dive

**Start with the distinction that most dashboards get wrong: groundedness is not accuracy.** Faithfulness asks only whether the answer follows from the context that was supplied. An answer that is perfectly entailed by a retrieved passage which is itself outdated, irrelevant, or wrong scores a clean 1.0 and is still false. This is why [RAGAS](https://www.vectara.com/blog/evaluating-rag) reports faithfulness alongside context precision and context recall rather than instead of them — grounding is the generation-side half of a two-sided problem, and reporting it alone lets a retrieval defect pass as a healthy system. If you carry one number to a review, carry two.

## How it is actually computed

Nearly every implementation reduces to the same two steps: **decompose, then check entailment.**

1. **Decompose** the response into atomic, individually-checkable claims.
2. **Check each claim** against the source as a natural-language-inference problem — is this claim *entailed*, *refuted*, or *neutral* with respect to the premise?
3. **Aggregate**, usually as the ratio of supported claims to total claims.

The implementations differ mainly in what performs step 2, and the choice is an engineering tradeoff rather than a quality ranking:

- **LLM-as-judge** (RAGAS faithfulness). Reference-free — it needs no human-written ground truth, which is what makes it deployable on real traffic. The cost is per-call latency and spend, and judge variance: the same pair can score differently across runs, so small deltas are not signal.
- **A fine-tuned NLI classifier** ([Azure AI Content Safety groundedness detection](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/groundedness), [Vectara HHEM](https://huggingface.co/vectara/hallucination_evaluation_model), MiniCheck). Cheap, fast, and low-variance because it is a classifier, not a generator. HHEM-2.1-Open runs in **under 600 MB of RAM at 32-bit precision and scores a 2k-token input in roughly 1.5 seconds on a modern x86 CPU** — inexpensive enough to run inline on every response rather than on a sample. Azure's model exposes a fast binary mode and a slower reasoning mode that names the ungrounded spans.

**The tradeoff that decides it for most systems is provenance, not accuracy.** A scalar score tells you a response is 0.41 without telling you *which sentence* is unsupported, and a score with no span attached cannot be shown to a user, fed to a retry, or triaged by an on-call engineer. If you intend to act on the signal automatically, pick the mode that returns claim-level or span-level output even when it costs more; if you only intend to chart it, the cheap scalar is fine. Note also that these scores are calibrated probabilities, not opinions — on Vectara's leaderboard a score below **0.5** is counted as a hallucination, and that threshold is a product decision you should set deliberately rather than inherit.

## What changes when it is an agent, not a single RAG call

Single-turn RAG has one premise: the retrieved chunk. An agent does not.

**The premise is the union of everything the run actually saw** — tool results, earlier assistant turns, injected [memory](/library/agent-memory-tiers), and system context. Scoring a final answer against only the last retrieval will mark grounded claims as hallucinated (the support came from a tool result three steps back) and ungrounded ones as fine. Getting this right requires the run's full trace, which is the practical reason [observability](/library/agent-observability) is a prerequisite for evaluation rather than a nice-to-have.

**Errors compound across steps.** An unsupported claim produced at step two enters the context and becomes a *premise* for step five, where it is now "grounded" by construction — the model is faithfully reasoning from its own earlier invention. Measuring only the final answer cannot see this. Score intermediate steps, or at minimum score the first step whose output feeds a subsequent tool call.

**Refusal is a feature, and it must be reachable.** "Grounded-or-refuse" — answer only from retrieved support, otherwise say you do not know — is the behavior regulated verticals like [healthcare](/library/healthcare-agents) and [finance](/library/finance-agents) require, and the fallback most implementations forget to build, so the model invents instead. A refusal path that exists in the prompt but has no worked example is not a refusal path.

## The failure has already been priced

In *[Moffatt v. Air Canada](https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html)*, 2024 BCCRT 149, an airline's chatbot described a bereavement-fare refund policy that did not exist. The tribunal held the airline responsible for the information its own agent gave, rejecting the argument that the chatbot was a separate entity. The engineering reading is narrow and useful: **an ungrounded claim about your own policy is an enforceable statement by you**, so the claims most worth gating are the ones about your prices, terms, and commitments — exactly the ones a [retrieval](/library/retrieval-quality) system is most likely to answer from a stale document.

## Instrument the distribution, not the mean

A mean groundedness of 0.93 is compatible with 7% of answers being confidently fabricated, and the mean is the number that will be on the dashboard. Track instead:

- **The low tail** — the share of responses below your action threshold, and whether that share is drifting.
- **Refusal rate**, alongside groundedness. Both rising together usually means retrieval degraded; groundedness rising while refusals collapse means the model got more confident, not more correct.
- **Provenance coverage** — the fraction of factual claims that carry a resolvable citation. This is the metric that separates a system you can debug from one you can only score.
- **Groundedness of intermediate steps**, not just final answers, for anything multi-step.

Pair every groundedness number with a retrieval number. Alone, it cannot tell you whether the agent is inventing things or faithfully repeating something wrong — and those two failures have completely different fixes.

*Related: [retrieval quality](/library/retrieval-quality), [rag basics](/library/rag-basics), [agent evaluation pitfalls](/library/agent-evals), [offline and online evaluation](/library/evaluation-strategy), [agent observability](/library/agent-observability), [human approval gates](/library/human-approval-gates).*
