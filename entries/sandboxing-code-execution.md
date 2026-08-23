---
id: sandboxing-code-execution
title: "How do you sandbox AI agent code execution?"
url: https://firecracker-microvm.github.io/
category: security
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-08-15
last_verified: 2026-08-15
superseded_by: null
evidence: []
tags: [sandboxing, isolation, microvm, firecracker, gvisor, egress, code-execution]
---
Treat every line of LLM-generated code as hostile: run it in a microVM (Firecracker) or user-space kernel (gVisor) rather than a plain shared-kernel container, and lock down network egress, secrets, filesystem, and resource limits first. Escapes are rare; exfiltration through what the sandbox is allowed to do is the common failure, so default-deny egress and broker credentials outside the sandbox.

## Deep dive

**Short answer:** treat every line of LLM-generated code as hostile, run it in its own kernel (microVM) or user-space kernel (gVisor) — not a plain Docker container — and lock down network egress, filesystem, and secrets before you worry about anything else.

## Why plain containers aren't enough

Traditional sandboxing protects you from *buggy* code on known paths. An agent executes code that was written at runtime by a model and may have been steered by prompt injection — the threat model is *arbitrary adversarial code*. Standard containers (Docker/runc) share the host kernel, so one kernel exploit turns "the agent ran a bad script" into "the attacker owns the box." By 2026 every major cloud has quietly moved untrusted-code paths off shared-kernel runc for exactly this reason.

## The three isolation tiers

1. **Hardened containers** (runc + seccomp/AppArmor, no root, read-only rootfs). Fastest startup, weakest boundary. Acceptable only for code you'd nearly trust anyway — e.g. your own test suite run by a coding agent in CI.
2. **User-space kernels** — gVisor intercepts syscalls in userspace, so guest code never talks to the host kernel directly. Good balance: ~100ms-class cold starts, strong syscall filtering. This is what Modal runs on.
3. **MicroVMs** — Firecracker / Cloud Hypervisor give each execution its own kernel with hardware-enforced isolation. The default for genuinely untrusted code; E2B, Fly.io, and Vercel Sandbox all use Firecracker. Cold starts are now low hundreds of milliseconds with snapshot/resume.

**Rule of thumb:** default to microVMs, relax downward only when your threat model (and latency budget) justifies it — not the other way around.

## The checklist that matters more than the runtime

Escapes are rare; exfiltration is not. In practice most real incidents flow through what the sandbox is *allowed* to do:

- **Network egress:** default-deny. Allowlist the few domains the task needs. This single control defeats most prompt-injection exfiltration.
- **Secrets:** never mount credentials into the sandbox. Proxy authenticated calls through a broker outside it, so stolen code can't steal keys.
- **Filesystem:** ephemeral, per-session, with an explicit copy-in/copy-out boundary. Nothing from the host is visible by default.
- **Resource limits:** CPU, memory, disk, wall-clock, and process caps — agents in loops will happily fork-bomb you by accident.
- **Rollback:** snapshot before execution so a destructive run is an undo, not an incident. Recent research on transactional sandboxing reports full rollback of failed states at ~15% overhead.

## Build or buy?

DIY (Lambda-glue or bare containers) reliably fails on cold starts, state loss, and shared-kernel gaps. If sandboxed execution isn't your product, use a managed runtime (E2B, Modal, Cloudflare Sandboxes, Vercel Sandbox, or open-source options like Alibaba's OpenSandbox) and spend your effort on the egress/secrets/limits policy above — that policy, not the isolation primitive, is where your security actually lives.

## Related

- [Prompt injection defense](/library/prompt-injection-defense) — the attack that makes sandboxing mandatory
- [Guardrails & safety](/library/guardrails-safety)
- [Tool retries & idempotency](/library/tool-retries-idempotency) — pairs with snapshot/rollback
