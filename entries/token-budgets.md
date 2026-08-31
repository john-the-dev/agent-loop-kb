---
id: token-budgets
title: "Token budgets change agent capability"
url: https://www.aisi.gov.uk/
category: evaluation
source_type: research
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'The AI Security Institute (AISI)'"
  - "WEAK CITATION, and this is the sharpest one in the PR: the url is an organisation HOMEPAGE, not a document. A homepage is not evidence for anything — it has no stable claim, and its content changes with the org's front page. AISI is a real and serious institute, but nothing at that url speaks to token budgeting"
  - "ACTIONABLE: this needs repointing at a specific AISI publication that actually addresses the entry's subject, or at a different source entirely. Of the two weak-citation shapes found in this PR — index-instead-of-item (memory-poisoning) and homepage-instead-of-document (here) — this is the more severe, because an index at least scopes the topic"
tags: [token, budgets, change, capability, security]
---

UK AI Security Institute evaluations found that increasing an agent's token budget from 1 million to 10 million tokens improved success on software-engineering tasks by roughly 25 percent. Some long-horizon cybersecurity tasks can require budgets near 50 million tokens. A weak result may therefore reflect an exhausted reasoning budget rather than a hard capability limit.

## Deep dive

Most teams treat the token budget as a cost knob. The more useful framing is that it is a **capability parameter**: the same model, on the same task, with the same scaffold, succeeds or fails depending on how much reasoning, retrying, and re-reading it is allowed to spend. UK AI Security Institute evaluations made this concrete — raising an agent's budget from 1 million to 10 million tokens lifted software-engineering task success by roughly 25 percent, and some long-horizon cybersecurity tasks only became solvable near 50 million tokens. An agent that "can't do" a task at a small budget may simply not have been allowed to finish.

## Budget is not the context window

The two get conflated constantly. The [context window](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) bounds how much a single call can see; the budget bounds how much a whole trajectory can spend across every call, retry, and subagent. An agent with a 200K window and a 1M budget is a very different system from one with the same window and a 50M budget — the second can afford exploration, verification passes, and recovery from dead ends. Budget exhaustion also fails differently: the run stops mid-task, while window pressure degrades quality gradually as compaction and truncation eat context.

## The eval implication: report the budget or the score is meaningless

If a benchmark reports "model X scores 40%" without stating the token budget, the number is not reproducible — a 2x budget difference can swamp a model-version difference. Treat budget like any other controlled variable: pin it, report it, and when comparing scaffolds or models, compare at equal spend. When an agent fails, check whether it ran out of budget before concluding it ran out of ability; the fix for the first is a dial, the fix for the second is a redesign. This is the same discipline as [evaluating agents](/library/agent-evals) under fixed tool sets — capability claims require controlled resources.

## Spending a big budget well

A large budget is only useful if the spend converts to progress. Three failure modes burn budget without buying capability: re-reading unchanged context every turn (attack with [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) — cached re-reads cost roughly a tenth of fresh input, which is what makes 10M-token trajectories affordable at all); stuffing the window until attention degrades — [Liu et al.'s "Lost in the Middle" (arXiv:2307.03172)](https://arxiv.org/abs/2307.03172) showed retrieval quality collapses for mid-context content, so more tokens in view is not more tokens used; and unbounded loops that retry a failing step until the cap (bound iterations, detect repeats, and surface exhaustion as an explicit outcome). Set the budget generously, then make exhaustion loud: a run that ends with "budget exhausted at step 14 of plan" is diagnosable, one that silently truncates is not.

*Sources: [Anthropic — Context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) · [Anthropic — Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) · [Liu et al., Lost in the Middle (arXiv:2307.03172)](https://arxiv.org/abs/2307.03172).*

*Related: [cost control & token economics](/library/agent-cost-control), [prompt caching](/library/prompt-caching), [agent evaluation pitfalls](/library/agent-evals), [context rot](/library/context-rot), [Agent Skills vs MCP servers](/library/agent-skills-vs-mcp).*