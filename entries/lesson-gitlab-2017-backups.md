---
id: lesson-gitlab-2017-backups
title: "Test your recovery, not just your backups"
url: https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; GitLab's own post-mortem is unusually detailed and public"
  - "DEAD SOURCE found 2026-08-31 by scripts/check-sources.mjs: the cited GitLab post-mortem returns HTTP 404 (control on the same origin 404s too, so this is a real removal, not a catch-all). GitLab took the post down; last_verified 2026-08-12 predates that"
  - "GRADE LEFT AT A DELIBERATELY, and flagged rather than quietly changed: the entry is a historical engineering lesson that is widely documented elsewhere, so its substance is not in doubt - but the CITATION no longer resolves and needs repointing at an archive or an equivalent write-up. Someone should decide that, not have it decided silently"
tags: [backups, recovery, state, memory]
---

In 2017 GitLab lost production data when a tired engineer removed a directory on the wrong host, then discovered that five separate backup/replication methods had silently been failing. Lesson: an untested backup is not a backup. For agents: verify that agent memory/state can actually be restored, and snapshot state before any destructive agent action so a bad step is recoverable.

## Deep dive

On 31 January 2017 GitLab.com lost roughly six hours of database data. GitLab then did something almost no company does: they [published a detailed post-mortem](https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/), documented the recovery live, and left the failure modes on the record. It remains the single most useful public artefact on the difference between having backups and having recovery.

The deletion is the part everyone remembers. It is the least interesting part.

## The deletion

An engineer was working a load incident late at night, dealing with replication that had fallen behind. Attempting to clear a data directory on the *secondary* so replication could be re-initialised, he ran the removal against the **primary** instead — two terminals, near-identical prompts, the wrong one focused.

He noticed within seconds and aborted. Hundreds of gigabytes were already gone.

Every element there is ordinary: fatigue, an incident already in progress, two similar-looking environments, a command that does not ask. This is what routine looks like on the night it goes wrong, and it is why "be more careful" is not a remediation.

## The actual finding: five recovery paths, none working

What turned a bad hour into a data-loss event was the discovery that **five separate mechanisms which everyone believed were protecting the data were all ineffective**, and had been for some time:

- Regular database dumps were failing silently — the dump tool's version did not match the database server's, so it errored out and produced **empty files**. The failure notification path did not reach anyone.
- Disk snapshots were not enabled for the database server.
- Uploads of the backups to object storage were empty.
- Replication, the thing being repaired that night, was itself the reason the operation was happening.

The pattern is not "backups were neglected." Someone had built each of these. They existed as configuration, as cron entries, as a documented procedure. **What none of them had was a test that could fail.** An empty dump file has a name, a timestamp, and a location — everything a monitoring check looking for *presence* would want. Only a check that tried to **restore** it would notice.

Recovery eventually came from an LVM snapshot taken roughly six hours earlier, for an unrelated staging purpose, by chance. The thing that saved GitLab was not part of the backup strategy.

## The agent translation

Agents accumulate state that is exactly this easy to lose and this rarely restore-tested: long-term memory stores, vector indexes, task queues, conversation history, learned preferences, workspace files.

- **"The backup ran" is not a signal.** A memory-store export that writes a zero-byte file, a vector index snapshot that captures an empty collection, a task-queue dump taken mid-transaction — each produces an artefact that satisfies an existence check and restores to nothing.
- **The destructive step often happens *during* an incident**, exactly as it did here. An agent asked to "clean up the workspace" or "reset the failed run" is operating at the moment when the operator is stressed and least likely to catch a wrong target. Recovery mechanisms need to work under precisely those conditions.
- **Agents make the two-terminals problem worse, not better.** Environments differ by a config value, not by anything visible in the transcript. An agent holding a handle to a resource has no equivalent of noticing the hostname in a prompt — it acts on whatever the tool resolved.
- **Rebuilding "from source" is often assumed and rarely true.** A vector index can be regenerated from documents — if the documents still exist, the chunking config is versioned, and the embedding model is still available at that version. Conversation-derived memory usually cannot be regenerated at all; the conversations are gone.

## What to actually build

**Make restore the test, not backup completion.** On a schedule, restore the artefact into a scratch environment and assert on *content*: row counts, index cardinality, a known-value spot check. A check that only asserts the file exists will pass on an empty file forever.

**Alert on the failure path, and test the alert.** GitLab's dumps were failing loudly enough to produce errors; nothing carried them to a human. A notification channel nobody has ever seen fire is an untested component.

**Snapshot before destructive agent actions, cheaply and automatically.** Before an agent deletes, overwrites, or bulk-edits, capture the prior state — a copy, a git commit, a filesystem snapshot. This is the agent-scale equivalent of the accidental LVM snapshot, except deliberate: the difference between an incident and an undo.

**Know your recovery time, by measurement.** "We have backups" is a claim about existence. "We can be back in twenty minutes, measured last month" is a claim about recovery. Only the second one is useful during an incident, and only measurement produces it.

**Separate the agent's blast radius from its own recovery data.** If an agent can delete its workspace, its snapshots cannot live only in that workspace. The backup must be somewhere the agent's destructive tools cannot reach.

## The test

Pick your agent's most valuable piece of state and ask: **when was it last restored, by whom, and what did they check?** If the answer involves the word "should," you have GitLab's position on 30 January — a set of mechanisms that everyone believes in and nobody has exercised.

Related: [Guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails), [Durable agent execution](/library/durable-agent-execution), [Deploy discipline](/library/lesson-knight-capital-deploy), [Agent memory tiers](/library/agent-memory-tiers).
