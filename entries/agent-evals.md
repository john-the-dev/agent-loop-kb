---
id: agent-evals
title: "Agent evaluation pitfalls"
url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
category: evaluation
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Demystifying evals for AI agents \ Anthropic' — a primary vendor engineering essay"
  - "CAVEAT driving B not A: the essay is squarely about eval pitfalls, so the topical fit is good — but this entry's specific claims (single-run pass rates hiding nondeterminism, short time/token limits misclassifying capable agents) are the sharp, checkable ones and rest entirely on one vendor essay with no second source"
  - "SHARED-SOURCE CAVEAT: this url backs TWO entries — agent-evals and evaluation-strategy. A redirect-normalised audit of all 59 entries on 2026-08-30 found only 2 shared sources covering 6 entries (55 distinct sources for 59 entries), so reuse is bounded and this is one of the two clusters, not a general pattern"
  - "NEGATIVE CONTROL: anthropic.com/engineering/not-a-real-post-xyz returns 404, so the 200 is a real page"
tags: [evaluation, pitfalls, evaluations, should, separate]
---

Agent evaluations should separate model quality from scaffold, tool, and environment failures. Single-run pass rates hide nondeterminism, while overly short time or token limits can misclassify capable agents. Use repeated trials, inspect trajectories, score intermediate outcomes, and test realistic failure recovery.

## Deep dive

Evaluating an agent is not like evaluating a chat completion. A chat eval grades one output against one input; an agent eval grades a *trajectory* — a sequence of decisions, tool calls, and recoveries in an environment that pushes back. Most teams discover this the hard way: their eval says the agent regressed when actually a tool timed out, or says it passed when it reached the right answer by a route that will fall over in production.

## The pitfalls that actually bite

**1. Blaming the model for the harness.** When a run fails, the cause may be the model, the scaffold, the tool, or the environment — and a bare pass rate cannot tell you which. [Anthropic's guide to agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) is blunt about this: read the transcripts. Attribute each failure before averaging them into a metric, or the metric will steer you into fixing the wrong layer.

**2. Trusting single runs.** Agent trajectories are highly nondeterministic — same task, same model, different tool-call order, different outcome. [τ-bench (arXiv:2406.12045)](https://arxiv.org/abs/2406.12045) formalized this with the pass^k metric: the probability an agent succeeds on *all* k attempts of the same task. Its headline finding — agents that look competent on pass@1 collapse on pass^8 — is the consistency gap production users actually feel. One green run is an anecdote, not a result.

**3. Grading only the final state.** Outcome-only scoring misses agents that succeed by accident and agents that did everything right until a recoverable stumble at step 19. Score intermediate outcomes too: did it choose sensible tools, recover from the injected error, stay inside its permissions? [OpenAI's evals guide](https://platform.openai.com/docs/guides/evals) treats these trajectory-level checks as first-class eval targets, not nice-to-haves.

**4. Capping runs too tightly.** Aggressive time or token limits misclassify capable-but-thorough agents as failures. Budget limits should reflect production reality, and a budget-exceeded run should be recorded as *budget-exceeded*, not merged into generic failure counts — they demand different fixes.

**5. Evals that never change.** A static suite saturates: the agent overfits to it and the scores drift up while production quality does not. Feed real production failures back in as new cases, and retire cases everyone passes.

## A minimal honest setup

Repeated trials per task (report pass^k, not just pass@1) · transcript review for every failure with a cause label (model / scaffold / tool / environment) · trajectory checks alongside outcome checks · realistic budgets with separately-tracked budget failures · a suite that grows from production incidents.

*Sources: [Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) · [τ-bench (arXiv:2406.12045)](https://arxiv.org/abs/2406.12045) · [OpenAI — Evals guide](https://platform.openai.com/docs/guides/evals).*

*Related: [evaluation strategy](/library/evaluation-strategy), [determinism & reproducibility](/library/determinism-reproducibility), [token budgets](/library/token-budgets), [agent observability](/library/agent-observability), [groundedness and hallucination](/library/groundedness-hallucination).*
