---
id: lesson-mars-climate-orbiter
title: "Interface contracts: mismatched units/schemas cause silent disaster"
url: https://en.wikipedia.org/wiki/Mars_Climate_Orbiter
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; NASA's mishap investigation board report is the primary source"
tags: [interfaces, schemas, validation, tools]
---

NASA lost the Mars Climate Orbiter in 1999 because one team produced output in imperial units while another consumed it as metric; the mismatch was never validated at the boundary. Lesson: every interface needs an enforced, typed contract. For agents: define strict tool schemas and validate types/units/formats at the tool boundary — never trust that the model and the tool agree on shape implicitly.

## Deep dive

In September 1999 the Mars Climate Orbiter arrived at Mars and was lost, having approached far closer to the planet than intended. NASA's investigation found the cause: ground software supplied by one organisation produced thruster impulse figures in **pound-force seconds**, while the navigation software consuming them expected **newton-seconds** — a factor of about 4.45.

The numbers crossed an organisational boundary carrying no statement of what they meant. Both sides were internally correct.

## The error was small, persistent, and cumulative

This was not one catastrophic miscalculation. The figures fed routine trajectory modelling over months of cruise. Each application nudged the modelled path slightly, and the error accumulated quietly into a trajectory materially different from the believed one.

That profile — small, systematic, compounding — is the hardest kind to catch, because nothing ever looks broken. A large error trips a sanity check. A 4.45× factor inside a plausible range simply produces confident, wrong numbers, and every downstream consumer treats them as fact.

Worth stating plainly: **navigators did observe anomalies** during cruise. The discrepancies were noticed. What was missing was a path by which "these numbers seem slightly off" became a resolved question before arrival rather than a background concern. A missing interface contract was the technical cause; the absence of a forcing function to chase the smell is why it survived.

## Why "just check the units" is the wrong lesson

The tempting fix is a code review that catches the unit. That will not generalise, because the failure was structural: **the interface had no place to put the unit.** The value was a number, the schema said number, and a number is exactly what was sent. No reviewer looking at either side in isolation would see a defect, because in isolation neither side had one.

The durable fix is making the contract carry meaning that both sides must satisfy — so a mismatch is a *failure*, not a silently-accepted value.

## The agent translation

Agent systems are almost entirely composed of this shape: a model emitting values across a boundary into code that interprets them.

- **JSON has no units, and the model has no obligation.** A tool taking `{"amount": 5000}` cannot tell cents from dollars, or `{"duration": 30}` seconds from minutes. The model picks based on the phrasing of a description, which is a prompt, not a contract.
- **Agent-to-agent hand-offs are the Lockheed/JPL boundary exactly** — two components, separately correct, exchanging values whose interpretation was never written down.
- **Type coercion hides the mismatch.** A tool accepting `"30"` and casting to int will equally accept `"30 minutes"` truncated, or a float rounded. Each coercion is a place a wrong-but-plausible value becomes an accepted one.
- **Compounding is worse for agents than for spacecraft**, because agents feed their own output back as input. A slightly wrong value enters context, is reasoned over, and produces further values consistent with the error. The system becomes internally coherent and externally wrong — and the transcript will *look* impeccable.

## What to actually build

**Put the unit in the name or the type, never in the description.** `timeout_seconds`, `amount_cents`, `distance_meters`. A field called `amount` with a description saying "in cents" is a request; a field called `amount_cents` is a contract that survives paraphrase, translation and truncation of the tool description.

**Validate at the boundary and reject, don't coerce.** The tool layer should refuse a malformed value rather than repair it. A rejection produces a correctable error the agent can see and retry; a coercion produces a wrong answer nobody sees. Prefer a loud failure at the edge over a quiet fix.

**Range-check against physical plausibility.** The orbiter's numbers were wrong but not absurd, which is why they passed. Bounds that encode what is *possible* for the domain — a timeout cannot be a year, a transfer cannot exceed the balance — catch the plausible-but-wrong class that type checks miss.

**Make the boundary schema the single source of truth** and generate both sides from it, so the two components cannot drift into being separately correct.

**Give small anomalies a place to go.** The technical fix is the schema; the organisational fix is that "this number looks slightly off" must land somewhere that forces resolution. In agent systems this means treating an eval that has drifted a few points, or an output that is subtly off-format, as a defect to chase rather than noise to tolerate.

## The test

For every value crossing into or out of your agent, ask: **if this arrived off by a constant factor, what would fail — and when?** If the answer is "nothing immediately, we would notice eventually from downstream behaviour," you have the Mars Climate Orbiter shape, and the time between the error and the noticing is your accumulation window.

Related: [Tool schema design](/library/tool-schema-design), [Guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails), [Evaluation strategy](/library/evaluation-strategy), [Multi-agent orchestration](/library/multi-agent-orchestration).
