---
id: computer-use-agents
title: "When should you use a computer-use (browser) agent?"
url: https://docs.claude.com/en/docs/agents-and-tools/computer-use
category: tools
source_type: docs
status: current
grade: unrated   # new entry — pending first evidence-graded review (see GRADING.md)
added: 2026-08-24
last_verified: 2026-08-24
superseded_by: null
evidence: []
tags: [computer-use, browser-agents, gui-automation, screenshots, accessibility-tree, prompt-injection, approval, idempotency]
---

A computer-use agent drives a real GUI by reading screenshots and emitting mouse and keyboard events. Use it only when no API, MCP server or CLI exists: it is far slower, costlier and more brittle than a tool call, and it runs inside an authenticated session, so page content is untrusted input and every irreversible click needs a gate. Prefer accessibility-tree or DOM observations over raw pixels, isolate the browser profile and credentials, allowlist domains, bound steps and cost, make retries idempotent, and verify outcomes from resulting state rather than the model's self-report.

## Deep dive

**Short answer:** a computer-use agent drives a real GUI by looking at screenshots and emitting mouse and keyboard events. Reach for it only when no API exists — it is an order of magnitude slower, costlier and flakier than a tool call, and every action is unsandboxed by default because it runs inside a real browser or desktop session with real credentials.

## When a computer-use agent is the wrong tool

Use the boring path first. If the system exposes an API, an MCP server, or even a CLI, call that instead. A GUI agent pays for every step:

- **Latency.** Each step is screenshot -> model -> action. A five-field form is five or more round trips, each carrying a full image. Tasks that an API finishes in 200ms take 30-90 seconds.
- **Cost.** Screenshots are large image inputs, resent every step. A long session re-uploads the same UI dozens of times.
- **Brittleness.** The agent binds to pixels and layout. A redesign, an A/B test, a cookie banner, or a different viewport size breaks it in ways no type system catches.

The honest rule: computer use is an *integration of last resort* for legacy systems, vendor portals with no API, and internal tools nobody will ever expose programmatically.

## The loop

The control loop is the ordinary agent loop with a screen as the observation:

1. Capture the current screen (full screenshot, or the accessibility tree if available).
2. Ask the model for the next action — `click(x,y)`, `type(text)`, `key(combo)`, `scroll`, `wait`.
3. Execute it against the browser or OS.
4. Re-capture and repeat until the goal is met or a budget is exhausted.

**Prefer structured observations over raw pixels where you can get them.** An accessibility tree or the DOM gives you stable element references instead of coordinates, which survives layout changes and costs far fewer tokens than an image. Many production stacks send both: the tree for targeting, a screenshot only when the tree is uninformative (canvas, video, image-only content).

## Why this is a security problem, not just an engineering one

A computer-use agent runs inside a session that is already authenticated. It has whatever the logged-in user has — mail, admin consoles, saved payment methods. That makes two failure modes serious:

- **Prompt injection from the page.** Everything the agent reads is untrusted input. Text on a web page, a PDF, or even a rendered image can carry instructions. An agent that treats page content as instructions will follow them, with the user's credentials. Keep a hard boundary: page content is *data*, only the user's request is an instruction. See [defending against prompt injection](/library/prompt-injection-defense).
- **Irreversible clicks.** Send, Delete, Confirm, Pay, and Accept are one coordinate away at all times. Gate them behind [human approval](/library/human-approval-gates) rather than trusting the model to be careful.

Practical containment:

- Run in a **dedicated browser profile or VM**, not the user's daily session.
- **Scope credentials** to the task; never leave a production admin session open to an autonomous loop.
- **Allowlist domains** and block navigation elsewhere, so an injected link cannot redirect the agent to an attacker's page.
- **Never let it solve CAPTCHAs or defeat bot detection** — beyond the ethics, a site serving you a challenge is telling you automation is unwelcome, and working around it converts a technical problem into a policy violation.
- Log every action with its screenshot. When a GUI agent goes wrong you cannot reconstruct what happened from text logs alone.

## Making it reliable enough to ship

- **Bound the loop.** Cap steps, wall-clock time and cost per task. A confused GUI agent will happily click forever; see [unbounded work will exhaust the system](/library/lesson-cloudflare-regex-2019).
- **Verify, don't assume.** After a submit, confirm the resulting state — a success banner, a row in a table, a changed URL. Model self-reports of "I clicked Save" are not evidence.
- **Make retries idempotent.** A retried purchase is a second purchase. Carry an idempotency key through the flow where the target system supports it.
- **Expect the interstitials.** Cookie banners, login walls, "are you still there" modals and A/B variants are the normal case, not the exception. Handle them explicitly rather than hoping the model improvises.
- **Batch predictable steps.** When the next few actions are knowable (click field, type, press Enter), issue them together instead of paying a screenshot round trip between each.

## Evaluating it

Screenshot-in/action-out makes conventional unit tests awkward, so evaluate at the task level: a fixed set of goals against a **pinned** environment, scored on whether the end state is correct — not on whether the agent took the path you expected. Record traces so a failure can be replayed. Live sites drift underneath you, so a suite pointed at production measures the internet's mood as much as your agent; pin a fixture site or a recorded session for anything you intend to gate a release on.

## The short version

Use an API if one exists. If you must drive a GUI, prefer structured observations to pixels, treat every screen as untrusted input, isolate the session and its credentials, gate the irreversible clicks, bound the loop, and verify outcomes from the resulting state rather than the model's narration.
