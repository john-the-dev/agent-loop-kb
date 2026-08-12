---
id: lesson-gitlab-2017-backups
title: "Test your recovery, not just your backups"
url: https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [backups, recovery, state, memory]
---

In 2017 GitLab lost production data when a tired engineer removed a directory on the wrong host, then discovered that five separate backup/replication methods had silently been failing. Lesson: an untested backup is not a backup. For agents: verify that agent memory/state can actually be restored, and snapshot state before any destructive agent action so a bad step is recoverable.

## Deep dive

The famous part of the GitLab incident is the `rm -rf` on the wrong host at 11pm. The important part is what came next: **five separate backup and replication mechanisms, and not one of them produced a usable restore.** Not "one failed" — five, independently, silently, over a long period. The deletion was the trigger. The absence of any working recovery was the actual outage, and it had been true for months.

## Every one of the five was "configured"

That is the detail worth sitting with. Nobody skipped backups; someone had set up five. They failed in unremarkable ways — a tool version mismatch producing empty dumps, a job whose failure notifications went to an address nobody read, a replication process that had quietly stopped. **Each one reported success in every cheap way available** and none was ever asked the only question that matters: *can you restore from this, right now?*

This is a general property of recovery mechanisms, not a GitLab-specific mistake: **a backup that is never restored is a hypothesis, and an unexercised hypothesis decays silently.** Nothing in the system objects. The dashboard is green because the dashboard measures whether the job ran, not whether its output is usable.

## For agents, the state you would need is not the state you are keeping

Agents accumulate exactly the kind of state this applies to — memory files, conversation history, learned preferences, task queues, in-flight claims — and it is easy to assume it is durable because it lives on disk somewhere. Two specific gaps show up repeatedly.

**The state is spread across places with different durability.** Some in a synced vault, some in a local file the sync ignores, some only in the running process. A restore that recovers the vault and not the rest gives you an agent that boots, looks healthy, and has quietly lost the thing that made it useful. Enumerate what would actually need to come back — not what happens to be backed up — and check the difference.

**Restoring is not the same as being asked to restore.** Untested restore paths hide encoding assumptions, path assumptions, and permission assumptions that only surface under real recovery. If you have never restored agent memory into a clean environment, you do not know that you can. The exercise is cheap and the knowledge is otherwise unobtainable.

## Snapshot before destructive steps, because "recoverable" is the design goal

The other half of the lesson is about the moment of loss. GitLab's engineer had no cheap way back. An agent taking a destructive action — deleting files, rewriting memory, bulk-updating records — should snapshot the affected state first, so the cost of a wrong step is a restore rather than an incident. That pairs directly with [bounded blast radius](/library/lesson-aws-s3-2017-guardrails): cap what one call can touch, *and* make what it touches recoverable.

And note the human factor GitLab's own write-up is admirably honest about: this happened late at night, to a tired person, during an incident. Agents remove the tiredness and keep everything else — including acting fast, under a hypothesis, on production. The recovery path is what makes that safe, not the confidence of whatever is issuing the command.

*Sources: GitLab's public post-mortem of the 2017-01-31 database incident.*

*Related: [guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails), [agent memory tiers](/library/agent-memory-tiers), [durable agent execution](/library/durable-agent-execution), [human approval gates](/library/human-approval-gates), [tool retries and idempotency](/library/tool-retries-idempotency), [agent observability](/library/agent-observability).*
