---
id: agent-skills-vs-mcp
title: "Should you write an Agent Skill or build an MCP server?"
url: https://agentskills.io/
category: protocols
source_type: docs
status: current
grade: B
added: 2026-08-25
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Agent Skills Overview - Agent Skills' (negative control on the same host 404s, so the 200 is real)"
  - "the url is a site ROOT but that is NOT a defect here — agentskills.io serves its documentation overview at the root, so the cited resource does address the subject"
  - "CAVEAT driving B not A: the entry is a COMPARISON (Skills vs MCP) and this source documents only the Skills side. A comparison sourced from one of the two things compared cannot settle where the boundary falls"
tags: [agent-skills, mcp, progressive-disclosure, tool-search, context-budget, tool-selection, capability-boundary, supply-chain]
---

An MCP server gives an agent reach it does not have — a connection, a credential, a running process. An Agent Skill gives it judgment about tools it can already use: a folder with a `SKILL.md` the agent loads only when the task matches. The usual tiebreaker — that MCP tool definitions sit in context all session while skills load lazily — is now only half true, because tool search defers MCP definitions too. Choose on the capability boundary instead: if a person could do the job from written instructions alone, it is a skill; if they would need a login, it is a server. Neither fixes tool-selection degradation past roughly 10-20 active tools.

## Deep dive

**Short answer:** build an **MCP server** when the agent needs to *reach* something — a database, a SaaS API, a filesystem, anything behind a credential or a running process. Write an **Agent Skill** when the agent needs to *know* something — your conventions, a review checklist, a multi-step procedure it gets subtly wrong on its own.

The handoff heuristic is the most reliable version of this test: **if you could write the capability down and hand it to a new colleague on paper, it is a skill. If they would also need a login, it is a server.** A skill cannot authenticate, hold a connection, or reach a system the agent could not already reach — no amount of Markdown grants network access. A server cannot teach taste; it exposes `run_query` and has no opinion about which query to run.

Most production agents need both, and the failure mode of skipping the skill half is easy to picture: you connect a CRM MCP server, ask for a weekly pipeline review, and the agent faithfully pulls every deal and dumps raw JSON into Slack. It knew how to reach the CRM. It did not know what a pipeline review is.

## What a skill actually is

A skill is a folder. The only required file is `SKILL.md`: YAML front matter with two mandatory fields — `name` and `description` — followed by a Markdown body. Optional subfolders hold executable scripts, reference documents, and assets like templates.

It loads in three tiers, which is the whole design:

1. **Discovery.** At startup the agent loads only each skill's `name` and `description` into the system prompt. That description is the trigger — it is what the model matches a request against, so it has to say both *what the skill does* and *when to use it*. A description that only says what it does will not fire.
2. **Activation.** When a task matches, the agent reads the full `SKILL.md` body into context. Published guidance recommends keeping that body under roughly 5,000 tokens.
3. **Execution.** The agent follows the instructions, loading referenced files or running bundled scripts only if it needs them.

The always-on cost is therefore just tier 1. One independent measurement across Anthropic's 17 official skills put median discovery cost near **80 tokens** per skill, ranging from about 55 to 235. That is the number to reason about when deciding how many skills to install — not the size of the folder, which is mostly never read.

Agent Skills started as a Claude feature in October 2025 and was published as an open specification that December. Because a skill is Markdown in a git repository, portability across agent runtimes came cheaply, and vendor write-ups now claim adoption across dozens of platforms. Treat the specific count as a marketing figure — what matters for a build decision is that the format is a checked-in file rather than a vendor API, so migrating it later is a copy, not a rewrite.

## The argument that stopped being true

The most-repeated reason to prefer skills is a token argument: *every MCP server you connect advertises its whole tool list — names, descriptions, parameter schemas — up front, and that sits in context all session whether you call it or not.*

The cost was real and large. GitHub's official MCP server has been measured at roughly **17,600 tokens** of tool definitions per request. Practitioners have reported far worse in the wild: one Docker server contributing around **126,000 tokens** across 135 tools, and sessions where MCP metadata consumed 40% or more of a 200K window before any work began.

**But this is now an implementation property, not a property of MCP.** Tool search inverts the loading model: definitions are marked deferred and withheld from the request, the model gets a single search tool instead, and it pulls in three to five relevant definitions — on the order of 3,000 tokens — when it actually needs them. In Claude Code this engages automatically once active MCP tool descriptions exceed a share of the context budget (roughly 10% by default), and you can watch the "MCP tools" line collapse in `/context` when it does. Anthropic's separate code-execution-with-MCP approach attacks the same overhead from another direction, letting the agent call tools from inside a script rather than loading every definition.

**Do not quote a single savings figure.** Published numbers range from about a 13,000-token saving in one measured session to "95% of per-turn tool token cost" to "98.7% reduction in context overhead" to Cloudflare's 99.9% claim for its own 2,500-endpoint API. These measure different things — per-turn versus per-session, tool search versus code execution, a normal toolset versus a deliberately enormous one — and most are vendor-published. The honest statement is directional: **deferred loading removes most of the always-on schema cost, and how much it removes depends entirely on your toolset.**

The engineering consequence: *if you are choosing a skill over a server to save context, check whether your runtime already defers tool definitions.* If it does, you have decided on a stale fact, and the decision should go back to the capability boundary.

## What neither one fixes

Tool search reduces the **token** cost of many tools. It does not reduce the **selection** problem, and those are different failures.

Models start degrading somewhere around 10-20 active tools: confusion between similarly-named tools, wrong tool chosen for the job, hallucinated tool names that never existed. Deferring definitions can make this marginally worse, not better — the model now has to search before it can choose, so every task pays discovery overhead, and a search over 50 near-duplicate tools returns 5 near-duplicate candidates.

The fix is unglamorous and has not changed: **fewer tools, with boundaries stated in both directions.** Disconnect servers you are not using. When two tools overlap, say so in each description ("use `search_issues` for open work; use `search_history` for closed"). Give a tool one job. A skill can help here — it can tell the agent *which* of your tools to reach for and in what order — but it is compensating for a tool surface that is too crowded, not curing it.

The other structural lever is a **subagent**: hand the sub-task to a fresh context window, pay the tool-definition cost once inside it, and return only the result to the parent. That trades tokens for a round trip and is worth it when the sub-task is genuinely independent.

## Composition: what a good pair looks like

The productive setup is a server for the pipes and a skill as the operator manual for those pipes.

A BigQuery MCP server exposes `list_tables`, `get_schema`, and `run_query`. That is access, and it is inert on its own — the agent can now reach the warehouse and has no idea what your revenue definition is. The skill supplies the procedure: check the schema before writing SQL, exclude internal test accounts, use the fiscal calendar and not the Gregorian one, never `SELECT *` on the events table, present results as a table with period-over-period deltas.

Neither half is sufficient, and the split is stable under change: when the warehouse schema changes you fix the server, and when the analysis convention changes you edit a Markdown file and commit it.

## Where the protocols are converging

Both sides are moving toward each other, which is worth knowing before you build something that assumes today's boundary is permanent. MCP has an extensions track covering asynchronous long-running tasks, inline interactive UI, and skills delivered over MCP itself; a 2026 protocol revision moves the base to stateless, self-contained requests with per-request capability negotiation, replacing the older stateful-connection model.

The practical guidance under that churn: keep the *knowledge* in files you own, in a format that is legible without a runtime. A `SKILL.md` in your repository survives a protocol revision. Instructions embedded in a vendor-specific tool description do not.

## Security: the tiers are a trust boundary

The three disclosure tiers map onto escalating trust, and a published survey of the area makes the mapping explicit: tier 1 metadata is the lowest trust level, tier 2 instructions require more, and **tier 3 — bundled executable scripts — requires the highest**.

State that plainly: **installing a third-party skill that ships scripts is installing code, not documentation.** The Markdown-in-a-folder format that makes skills portable and reviewable also makes them trivial to publish, fork, and typosquat. Review a skill the way you review a dependency — read the body, read every script, pin the version, and prefer skills that ship no executables when instructions alone would do.

The same applies in the other direction. A skill body is instructions the model will follow; if any part of it is assembled from untrusted input, you have built a prompt-injection channel with your own hands.

## The decision, in order

1. **Can the agent already reach the system?** No → build the MCP server. There is no skill-shaped answer to "I need a credential."
2. **Can it reach it but does it badly?** → write the skill. This is the common case and the one teams skip.
3. **Are you choosing a skill to save context?** → check whether your runtime defers tool definitions first. If it does, that reason is gone; decide on the capability boundary.
4. **Do you have more than about 20 active tools?** → the problem is the tool surface, not the loading strategy. Disconnect, consolidate, or delegate to a subagent.
5. **Is the skill from someone else and does it ship scripts?** → review it as a dependency, because that is what it is.

*Related: [MCP](/library/mcp), [MCP stateless transport](/library/mcp-stateless), [tool schema design](/library/tool-schema-design), [subagents](/library/subagents), [token budgets](/library/token-budgets), [prompt injection defense](/library/prompt-injection-defense), [sandboxing code execution](/library/sandboxing-code-execution).*
