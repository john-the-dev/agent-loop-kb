---
id: lesson-cloudflare-regex-2019
title: "Unbounded work will exhaust the system"
url: https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; primary source is Cloudflare's own incident write-up"
tags: [resource-limits, runaway, loops, budgets]
---

In 2019 a single regular expression with catastrophic backtracking consumed CPU globally and took Cloudflare offline. Lesson: any operation without an explicit bound can consume all resources. For agents: cap loop iterations, token budgets, tool-call counts, and wall-clock per task — a runaway agent loop is the same failure mode as an unbounded regex, and needs the same hard ceilings.

## Deep dive

On 2 July 2019 Cloudflare served 502s across its global network for roughly half an hour. The cause was not a network partition, a bad certificate, or a datacentre failure. It was one line of a firewall rule — a regular expression that, on certain inputs, did an amount of work that grew explosively rather than linearly.

The reason this incident is worth an agent engineer's attention is not the regex. It is the *shape* of the failure, which recurs every time a system contains a step whose cost is determined by its input rather than by a budget you set.

## Catastrophic backtracking, briefly

A backtracking regex engine explores alternatives when a match fails. Most of the time that exploration is cheap. But certain patterns — typically nested quantifiers over overlapping character classes, the `(a+)+` family — can force the engine to try an exponential number of ways to split the input before concluding that it does not match.

The important property is that **nothing about the pattern looks expensive**. It is a short string. It passes review. It works on every test input anyone tried. The cost only materialises when a particular input meets a particular pattern, and then it does not degrade gracefully — it goes from microseconds to "this CPU is now busy forever."

Cloudflare's write-up, [Details of the Cloudflare outage on July 2, 2019](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/), is unusually candid about this. The rule was a WAF pattern intended to catch inline JavaScript in requests. It was deployed globally, at once, to a process sitting directly in the request path. CPU across the fleet went to 100% and legitimate traffic stopped being served.

## Three failures stacked, not one

It is tempting to file this as "someone wrote a bad regex." That reading loses most of the value. There were three independent conditions, and removing *any one* of them would have prevented a global outage:

1. **An operation with no cost ceiling.** The regex could consume unbounded CPU. Nothing above it said "this may take at most N milliseconds, then it is killed."
2. **A blast radius equal to the whole fleet.** The rule went everywhere simultaneously. There was no canary population absorbing the damage first.
3. **The failing component sat on the critical path.** A WAF that cannot decide fails *closed* into the request path, so its exhaustion is the customer's outage.

That stacking is the general form. Individually each is a design choice someone would defend. Together they convert a bug into an incident.

## Why this is an agent-loop lesson, not a regex lesson

An agent loop is a piece of software whose runtime is *not* bounded by its source code. The number of iterations depends on what the model decides, which depends on what the tools return, which depends on the world. That is precisely the property that made the regex dangerous, except an agent has more ways to express it:

- **Iteration count.** A plan-act-observe loop with no step cap will happily run until something external stops it. A model that cannot make progress often does not stop — it re-reads the same file, re-runs the same failing command, or alternates between two tools indefinitely.
- **Token spend.** Context grows with every observation. Cost per step therefore *rises* as the loop continues, so a runaway loop is not linear in expense — it accelerates.
- **Wall-clock.** A single tool call — a query, a crawl, a subprocess — can hang. Without a timeout the loop does not spin; it simply stops, holding its resources, which is harder to detect than a busy loop.
- **Fan-out.** One agent spawning sub-agents that spawn sub-agents is exponential work from a linear-looking instruction, the closest structural analogue to nested quantifiers.

Note that these bounds are not interchangeable. A step cap does not bound spend, because one step can retrieve a very large document. A token budget does not bound wall-clock, because a hung call burns no tokens. A wall-clock timeout does not bound fan-out, because children may outlive the parent's deadline. Each dimension needs its own ceiling.

## What to actually build

**Give every loop four independent budgets** — steps, tokens/cost, wall-clock, and concurrent children — and make exceeding any one of them a *structured* outcome rather than a crash. The agent should be able to report "I hit the step limit while doing X, here is where I got to," because a truncated answer with a stated reason is useful and an OOM is not.

**Bound the individual tool call too, not just the loop.** The loop budget is the aggregate; per-call timeouts are what stop one hung request from consuming the entire task budget. This is the direct analogue of what Cloudflare adopted afterwards: moving toward a regex engine with linear-time guarantees, so a single pattern *cannot* consume the process regardless of input.

**Roll capability changes out in stages.** A new tool, a new prompt, a raised limit — these are deploys. Give them a canary population, and make the rollout reversible without a code change. Cloudflare's rule reached every machine at once; the fix that mattered as much as the regex engine was changing how rules ship.

**Prefer failing open where the agent is not the safety boundary.** If your agent enriches a response and it stalls, the request should proceed without the enrichment. Reserve fail-closed for the cases where acting without the check is genuinely worse than not acting — and know which you have chosen, deliberately, per component.

## The generalisable test

Ask of any step in your system: *what input makes this cost 1000× what it usually costs, and what stops it?* If the answer to the second half is "nothing, it has never happened," you have the Cloudflare shape. The bound does not need to be clever. It needs to exist, be enforced by something the failing component cannot influence, and be small enough that hitting it is survivable.

Related: [Durable agent execution](/library/durable-agent-execution), [Controlling agent cost](/library/agent-cost-control), [Guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails).
