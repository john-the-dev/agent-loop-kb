---
id: lesson-ariane5-501
title: "Reuse code only after re-validating its assumptions"
url: https://en.wikipedia.org/wiki/Ariane_flight_V88
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; the ESA inquiry board report is the primary source"
tags: [code-reuse, assumptions, overflow, regression]
---

Ariane 5's maiden flight was destroyed in 1996 when inertial-reference software reused from the slower Ariane 4 hit an unhandled overflow under the new rocket's higher values. Lesson: reused components carry hidden assumptions from their original context. For agents: prompts, tools, and sub-agents reused in a new task carry old assumptions — re-test them in the new context instead of assuming they transfer.

## Deep dive

On 4 June 1996 Ariane 5 Flight 501 was destroyed about 37 seconds after lift-off, taking roughly $370M of payload with it. The inquiry board's report is one of the clearest engineering documents ever written about **reuse**, and its findings go well beyond the arithmetic bug everyone remembers.

The software was correct. It had flown successfully many times. It was destroyed by being moved.

## What happened, in order

The inertial reference system carried code from **Ariane 4**. Inside it, a 64-bit floating-point value representing horizontal velocity was converted to a 16-bit signed integer. On Ariane 4's flight profile that value could never grow large enough to overflow, so the conversion was safe — provably so, for that rocket.

Ariane 5 flies a different trajectory, with substantially greater horizontal velocity. The same conversion overflowed. The unit raised an operand error and shut down. **The backup unit, running identical software on identical inputs, had already failed the same way moments earlier.**

Then the part that turns a component fault into a loss of vehicle: the failed unit emitted a **diagnostic bit pattern** onto the data bus. The on-board computer read that pattern **as though it were flight data**, computed a wildly incorrect attitude correction, commanded extreme nozzle deflection, and the vehicle broke up under aerodynamic load.

And the coldest detail: the calculation that overflowed served an **alignment function only meaningful before lift-off**. On Ariane 4 it was left running for a period after take-off for operational convenience. On Ariane 5 it had no function at all. **The code that destroyed the rocket was not needed on that rocket.**

## Four distinct failures worth separating

1. **An assumption that lived in the environment, not the code.** "Horizontal velocity fits in 16 bits" was true of Ariane 4 and was never written down as a requirement — it was a property of the vehicle the code happened to run on.
2. **Redundancy that shared a failure mode.** Two units, same software, same inputs, same instant. Redundancy protects against *independent* failure; identical logic given identical data is not independent.
3. **Dead functionality left active.** The alignment routine had no purpose after lift-off on Ariane 5, and running it was pure exposure.
4. **A diagnostic consumed as data.** No layer distinguished "this is a measurement" from "this is an error report." The consumer trusted the bus.

## The agent translation

Agent systems are built almost entirely from reused components moved into new contexts — that is the design philosophy, not an accident.

- **Prompts carry their original distribution as an unwritten assumption.** A classifier prompt tuned on short support tickets, pointed at 40-page contracts, does not announce that its assumptions have expired; it returns confident labels. The Ariane 4 assumption was invisible for the same reason — nothing was wrong until the inputs changed.
- **A sub-agent reused for a new task inherits its old scope.** Tool descriptions, few-shot examples and refusal boundaries were all shaped by the first job. In the second, they are silent constraints nobody re-derived.
- **Running the same model twice is not redundancy.** Two calls, same prompt, same context: correlated failure. Genuine redundancy needs a different model, a different prompt formulation, or a deterministic check — something whose failure mode is not the first one's.
- **The diagnostic-as-data failure is endemic to agents, and worse.** A tool returning `"Error: rate limited"` as a *string* enters context as text. The model reads it as content and may summarise, quote, or act on it. `{"result": "Error: not found"}` is exactly Ariane 5's bit pattern on the bus: an error report in the channel reserved for answers. Unlike the flight computer, an LLM will often *paper over* it plausibly, so the failure surfaces later and further from its cause.
- **Dead tools are live risk.** A tool left registered because it was useful in the previous configuration is reachable, and an agent enumerating its options will eventually call it.

## What to actually build

**Write the assumption down where it is checked, not where it was true.** If a tool assumes inputs under some size, assert it in the tool and fail loudly. An assumption that exists only in the head of whoever chose the original context does not survive reuse.

**Re-run your evals when you move a component, not only when you change it.** A prompt moved to a new domain is a *change* even though the diff is empty. "Same code, new context" is precisely the Ariane 5 shape, and an empty diff is what makes it feel safe.

**Make error channels structurally distinct from result channels.** A tool result should carry an explicit status the orchestration layer inspects *before* the payload ever reaches the model's context. Errors that arrive as prose are indistinguishable from answers, and by the time the model has reasoned over one, the mistake is upstream of everything it says next.

**Delete tools and code paths that the current configuration does not need.** Not disabled behind a flag — removed. Reachability is the risk.

**Diversify redundancy deliberately.** If a check matters, its second opinion must fail differently: a rules engine beside a model, a different provider, a deterministic validator. Otherwise you have one check billed twice.

## The test

For any component you are about to reuse, ask: **what was true of its original environment that is not stated anywhere in it?** Input ranges, latency, formats, language, document length, who could call it. Then ask whether each of those still holds. If you cannot enumerate the assumptions, you have not established that the reuse is safe — you have established that it compiles.

Related: [Tool schema design](/library/tool-schema-design), [Interface contracts](/library/lesson-mars-climate-orbiter), [Evaluation strategy](/library/evaluation-strategy), [Deploy discipline](/library/lesson-knight-capital-deploy).
