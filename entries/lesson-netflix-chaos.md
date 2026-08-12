---
id: lesson-netflix-chaos
title: "Inject failure deliberately to build resilience"
url: https://netflix.github.io/chaosmonkey/
category: lessons
source_type: retrospective
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; Netflix has documented the practice publicly for over a decade"
tags: [chaos-engineering, resilience, testing, fault-injection]
---

Netflix's Chaos Monkey randomly kills production instances so the system is forced to tolerate failure as a normal condition rather than a rare emergency. Lesson: resilience comes from routinely exercising failure paths, not avoiding them. For agents: fault-inject dependencies — time out tools, return malformed tool output, drop context — and confirm the agent degrades gracefully instead of only testing the happy path.

## Deep dive

Chaos Monkey is usually described as "Netflix randomly kills servers," which makes it sound like bravado. The actual argument is narrow and almost boring, and that is what makes it useful.

Instances fail. In a large fleet they fail constantly, whether or not anyone chooses it. So the only real choice is **when** you find out whether your system tolerates it: at 3am during an unplanned event, or at 2pm on a Tuesday with the authors watching. Chaos Monkey moves the discovery to the hour you pick.

## The insight is about frequency, not destruction

The recovery path is the least-exercised code in any system. It runs rarely, so it rots quietly — a stale config, a dependency that no longer resolves, a timeout that was tuned for a topology three migrations ago. Nothing tells you, because nothing runs it.

The GitLab incident makes the same point from the opposite direction: [five recovery mechanisms that all existed and none of which worked](/library/lesson-gitlab-2017-backups), because none had been *run*. Chaos engineering is the preventative form of that lesson. Run the failure path often enough and it stays honest.

The second-order effect matters more than the first: when instance death is routine, engineers **design** for it. Nobody builds a service that cannot survive losing a node when they know a node will be taken at random this week. The tool changes behaviour upstream of the failures it causes.

## Doing it without being reckless

The practice only works with discipline attached, and this is the part usually skipped:

- **Business hours, with people watching.** The point is to learn, and learning requires someone present.
- **A blast radius you chose**, starting small — one instance, one dependency, one region — and expanding only as confidence is earned.
- **A stop button**, and a way to tell chaos-induced failure from a real incident happening simultaneously.
- **A hypothesis first.** "We believe losing one node produces no user-visible change" is a claim that can be *wrong*. Randomly breaking things without a stated expectation is not an experiment; it is an outage you scheduled.

## The agent translation

Agent systems have unusually many failure paths and unusually little exercise of them, because the happy path is so demo-able. Every dependency is an injection point:

- **Tool timeouts.** What does the agent do when a tool hangs? Retry forever, block, or report? Most agents have never been asked.
- **Malformed tool output.** Return invalid JSON, a truncated response, or an error string in the result field. Does it recover, or does it reason confidently over garbage? This is the [Ariane 5 diagnostic-as-data failure](/library/lesson-ariane5-501) and it is trivially injectable.
- **Empty or wrong retrieval.** Return zero documents, or plausible documents about the wrong entity. Does the agent say it does not know, or does it answer anyway? This single test distinguishes systems that fail loudly from systems that fail convincingly.
- **Context truncation.** Drop the middle of a long context. Does behaviour degrade gracefully or silently change?
- **Model unavailability.** 429s and 5xx from the provider. Does the fallback path exist, and has it ever run?
- **Sub-agent failure.** A child returns nothing, or an error, or contradicts a sibling. Does the parent notice?

**The agent-specific hazard is that failures are absorbed rather than surfaced.** A crashed server is unambiguous. An LLM handed a bad tool result will often produce a fluent, plausible answer — the failure is *converted into confident text*. That makes chaos testing more valuable here than in conventional systems, not less: without deliberate injection you will never see the failure mode, because the system is designed to smooth it over.

## What to actually build

**Add a fault-injection layer to the tool runtime**, off by default, that can force a timeout, an error, malformed output or empty results for a named tool. Cheap to build once, usable in every eval afterwards.

**Put failure cases in the eval suite, not just capability cases.** For each, assert the *behaviour you want*: says it does not know, retries once then reports, escalates. "Does not crash" is too weak a bar — answering confidently from nothing does not crash either.

**State the hypothesis in the test name.** `test_agent_reports_unknown_when_retrieval_returns_nothing` is a claim that can fail. `test_retrieval_failure` is a description of a scenario.

**Run it against production configuration, on a schedule.** A fault-injection suite that only runs against a fixture stops tracking reality the moment prompts, models or tool implementations change — which is weekly.

## The test

Pick your agent's most-used tool and ask: **when did it last return an error in a real run, and what did the agent do?** If you cannot answer, you do not know what your system does when it fails — you only know what it does when it works.

Related: [Test your recovery, not just your backups](/library/lesson-gitlab-2017-backups), [Evaluation strategy](/library/evaluation-strategy), [Reuse code only after re-validating](/library/lesson-ariane5-501), [Durable agent execution](/library/durable-agent-execution).
