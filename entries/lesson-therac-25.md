---
id: lesson-therac-25
title: "Concurrency bugs and removed safety interlocks are lethal"
url: https://en.wikipedia.org/wiki/Therac-25
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; canonical account is Leveson & Turner's investigation"
tags: [safety, concurrency, interlocks, autonomy]
---

Between 1985 and 1987 the Therac-25 radiation therapy machine delivered massive overdoses to patients, killing several. Hardware interlocks present on earlier models had been removed in favour of software checks, and a race condition in the operator interface could leave the machine in an unsafe configuration. Lesson: software-only safety, plus concurrency, plus ignorable alarms is a fatal combination. For agents: keep an enforcement layer the agent cannot reason its way past, and treat frequent warnings as a defect in the warning.

## Deep dive

The Therac-25 is the most-taught software safety case there is, and it is usually taught badly — as "a race condition killed people." The race condition was real, but it was the *last* link in a chain, and every earlier link is a decision that looks entirely reasonable in a design review. Nancy Leveson and Clark Turner's investigation remains the canonical account, and its lasting contribution is that it refuses the single-cause story.

For anyone building autonomous systems, the relevant chain is this: a physical safety mechanism was removed because software could do the same job; the software's correctness depended on timing nobody had specified; and when it failed it emitted a warning that operators had been trained by experience to dismiss.

## Removing the interlock is the decision that matters

Earlier models — the Therac-6 and Therac-20 — had **hardware** interlocks. If the machine was configured to fire a high-energy electron beam without the beam-spreading target in place, physical circuitry prevented it. The Therac-25 removed those interlocks and relied on software to enforce the same invariant.

This was not negligence in the moment. The software had run for years on the earlier machines apparently without incident, which read as evidence that it worked. It was not: on those machines the hardware had been *silently catching* the software's mistakes the whole time. Removing the interlock did not introduce the bug. It revealed one that had always been there, by deleting the thing that had been masking it.

That is the sharpest transferable idea here. **A redundant safety layer that never visibly fires looks like dead weight and is often exactly what is holding the system up.** You cannot infer that a check is unnecessary from the observation that it has never saved you — you have to know whether it has been quietly saving you all along.

## The race, and why "just fix the race" misses it

The specific failure involved an operator entering treatment parameters, then correcting them quickly using the terminal. If the edits happened faster than the software's internal state machine expected — a sequence a *practised* operator would produce and a novice would not — the machine could end up with its magnets configured for one mode and its beam energy set for another.

Note who triggers it: the expert. The failure mode was reachable specifically by someone who had become fast at the interface. Testing performed by people carefully stepping through the procedure would never see it.

Fixing that particular race would not have made the machine safe, because the design permitted an unsafe physical state to be *expressible at all*. The durable fix is not "no races." It is that the dangerous configuration must be unreachable — enforced by something that does not share the buggy component's assumptions.

## Alarms that are always on are not alarms

The machine did notice something wrong. It displayed a cryptic code — a `MALFUNCTION` with a number — and these appeared often enough during normal operation, for benign reasons, that operators had learned to acknowledge and continue. That is not operator error. It is a system that trained its users, correctly and rationally, to ignore it.

Any warning that fires routinely without consequence is being actively decommissioned by the people receiving it. The frequency *is* the defect.

## Mapping onto agent systems

The pattern translates almost line for line:

- **The removed interlock** is the guardrail deleted because "the model handles it now." A tool allowlist, a confirmation prompt before irreversible actions, a sandbox boundary — each looks redundant during the stretch when the model happens to behave. Model behaviour is a distribution, not a guarantee; if it has been in-distribution for a month, that is not evidence the boundary is unneeded.
- **Software-only enforcement** is asking the model to police itself. A system prompt saying "never delete without confirming" is a *request*. It shares its failure modes with the thing it constrains — the same context that can be confused, crowded out, or injected into. Enforcement has to live where the agent cannot argue with it: in the tool layer, in permissions, in a process boundary.
- **The race** is concurrent agents mutating shared state — two loops writing the same file, a sub-agent acting on state its parent has already changed. Same shape: legal individually, unsafe interleaved, and only reachable at speeds your manual testing never reaches.
- **The ignorable alarm** is the low-signal approval prompt. An agent that asks permission for everything trains its owner to click yes, which destroys the value of the one prompt that mattered. Confirmation is a scarce resource and should be spent on irreversibility.

## What to actually build

**Put the enforcement below the intelligence.** The layer that says no must be code the agent cannot rewrite, prompt, or persuade — checked at the point of effect, not the point of intent.

**Make the dangerous state unrepresentable**, rather than detected. Do not let an agent hold a handle to production and a "delete" verb and rely on a check between them; issue capabilities scoped so the destructive combination cannot be assembled.

**Budget your interruptions.** Decide what genuinely requires a human, make those prompts rare and specific, and drive everything else to either safe-by-default or reversible. If your users are clicking through, you have no confirmation step — you have a delay.

**Be suspicious of removing a check that has never fired.** Instrument it first: make it count and report near-misses. A guardrail that has silently prevented forty bad calls this month is not dead weight, and until you measure you cannot tell those two cases apart.

Related: [Prompt injection defense](/library/prompt-injection-defense), [Guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails), [Deploy discipline](/library/lesson-knight-capital-deploy).
