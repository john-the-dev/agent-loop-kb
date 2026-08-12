---
id: lesson-knight-capital-deploy
title: "Deploy discipline: dormant code + partial rollout can be catastrophic"
url: https://en.wikipedia.org/wiki/Knight_Capital_Group
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; widely documented, incl. the SEC administrative proceeding"
tags: [deploy, rollout, feature-flags, risk]
---

Knight Capital lost ~$440M in 45 minutes in 2012 after a deploy left an old, repurposed feature flag enabling long-dormant code on some servers but not others. Lesson: never leave dead code reachable, and roll changes out uniformly with kill-switches. For agents: version and feature-flag tool rollouts, remove dormant tool paths an agent could trigger, and make a bad rollout instantly reversible.

## Deep dive

On 1 August 2012, Knight Capital — then one of the largest market makers in US equities — lost roughly $440 million in about 45 minutes. The firm did not recover; it was acquired shortly afterwards. The proximate cause was a deployment, and the shape of it is worth knowing in detail because almost every element recurs in agent tool rollouts.

## What actually happened

Knight was deploying code for a new order-routing feature. The deployment went to eight servers. **One did not receive the new code.**

The new code reused a configuration flag that had previously controlled a different, long-retired function — an old routing behaviour that had been dormant in the codebase for years. On the seven updated servers, setting that flag activated the new feature as intended. On the eighth, the same flag activated the *old* dormant code.

That old code began sending orders into the market at enormous volume. Because the two paths were controlled by the same flag, the system had no way to express "new behaviour on" and "old behaviour off" separately — they were the same bit.

## The part that is usually left out: the rollback made it worse

When the errant orders started, the team's reasonable first move was to roll back the new code. They removed it from the servers — **including the seven that were working correctly.**

The flag was still set. Rolling back restored the dormant path everywhere. An action taken to stop the bleeding propagated the failure from one server to eight, and the volume of bad orders increased.

This is the detail most retellings drop, and it is the most transferable one. **Under time pressure, the recovery action is chosen from an incorrect model of the failure, and a rollback is only safe if you know what it restores.** They believed the new code was the problem. The problem was the flag plus the *absence* of the new code — precisely the state a rollback creates.

## Four conditions, each individually defensible

- **Dormant code left reachable.** The old function had not been used in years. Deleting unused code feels like gratuitous risk; leaving it feels free. It is not free — it remains reachable, and its assumptions have long since stopped being reviewed.
- **A flag reused across versions.** Recycling a config key is tidy. It also means the key's meaning depends on which build reads it, so the same value denotes two different behaviours across a fleet mid-deploy.
- **A non-atomic rollout.** Eight servers, seven updated. During any staged deploy the fleet is heterogeneous by design — so "the flag means X" is false for a window, and that window is when the deploy is happening.
- **No kill switch, and no fast way to tell which server was wrong.** The alerts fired, but they did not localise the fault. Forty-five minutes is a long time only if you know where to look.

## The agent translation

An agent's tools are a deployed surface, and they change more often and more casually than server code does — a prompt tweak, a new tool, a permission widened. The same four conditions apply:

- **Dormant tool paths are the direct analogue of dead code.** A tool left registered "in case we need it," an old code path behind a config check, a deprecated action still present in the schema — an agent enumerates its tools and will eventually call one. Unused-by-humans is not unused-by-agents. **If a tool should not be called, unregister it; do not merely stop documenting it.**
- **Config keys reused across agent versions** produce the identical failure: the same value meaning different things depending on which build of the loop reads it. Version the key, or version the meaning, but do not silently reassign.
- **Heterogeneous fleets are the normal state** for anything with multiple workers, hosts, or a desktop app plus a server. During a rollout you have two agent versions live, and shared state written by one is read by the other.
- **The rollback question is the one to rehearse:** if the new tool version misbehaves, does reverting return you to a *known* state, or to an older code path that the current configuration will drive somewhere unexpected? If you cannot answer, your rollback is a second experiment, run under pressure.

## What to actually build

**Delete dormant paths rather than disabling them.** The removal is the safety property. A path behind a flag is reachable; a path that is not in the binary is not.

**Never reuse a flag name across a semantic change.** New behaviour, new key. Old keys get removed after the old readers are gone, in that order — not simultaneously.

**Give tool rollouts a canary and an instant, config-only kill switch.** "Instant" means it does not require a deploy, because during an incident a deploy is the slow path. And a kill switch that turns the agent *off* is worth more than one that tries to correct it.

**Make the fleet's version state observable.** You should be able to answer "which agent version is each worker running, and what config is it reading?" in seconds. Knight's forty-five minutes was mostly spent not knowing which server was wrong.

**Bound what one rollout can lose.** Deploy to a fraction, watch a real signal, expand. The value of a canary is not that it catches everything — it is that when it fails, it fails at one-eighth scale.

Related: [Guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails), [Unbounded work will exhaust the system](/library/lesson-cloudflare-regex-2019), [Concurrency bugs and removed safety interlocks](/library/lesson-therac-25), [Durable agent execution](/library/durable-agent-execution).
