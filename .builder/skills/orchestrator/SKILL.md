---
name: code-task-orchestrator
description: Use this skill when a task is large enough that quality, speed, or reliability improves with explicit decomposition and sub-agent execution.
---

# Code Task Orchestrator Skill

Core idea: the parent agent orchestrates, sub-agents execute scoped units, and progress lives in durable state files under `.git/`.

## When to use

Use this skill when any are true:

- Task has 2+ independent units (files, issues, endpoints, services, data slices).
- User asks for broad triage or analysis (for example, all open issues).
- Task likely spans multiple turns and may hit context compaction.
- You need parallel execution to finish in reasonable time.

## Non-negotiable rules

1. Do not execute unit-level work in the parent agent.
2. Decompose before execution.
3. Use sub-agents for all unit execution.
4. Parallelize independent units by default.
5. Store plan and state files under `.git/opencode-orchestrator/<run-slug>/`.
6. Update state after every unit or batch.
7. Parent agent owns integration, conflict resolution, and final QA.

## Plan lifecycle protocol (required)

This workflow is stateful. The plan and state files are the source of truth.

### A) When plan and state are required

Create or refresh files immediately when either condition is true:

1. Task has 2+ independent units, or
2. Task may span turns and risk compaction.

Do this before launching any sub-agent.

Required files:

- Plan: `.git/opencode-orchestrator/<run-slug>/plan.md`
- State: `.git/opencode-orchestrator/<run-slug>/state.json`

If missing, create first. If present, read and reconcile first.

### B) Mandatory pre-execution gate

Do not spawn sub-agents until all are true:

- Objective and measurable success criteria are documented.
- Work units are enumerated with stable `unit_id` values.
- Dependencies are recorded (`independent` vs `blocked-by`).
- Execution batches are defined (`parallel` or `sequential`).
- State file exists with each unit initialized to `pending`.

If anything is missing, update plan/state before continuing.

### C) What must be in plan.md (minimum contract)

`plan.md` must include:

- Objective and success criteria.
- In-scope and out-of-scope boundaries.
- Hard constraints (safety, tools, cost, rate limits, non-goals).
- Work unit index with stable IDs and exact scope per unit.
- Dependency map between unit IDs.
- Batch strategy and max concurrency.
- Sub-agent task-card contract (required fields and output format).
- Integration rules (dedupe, tie-breaking, merge strategy).
- Verification gates (unit-level and final).

If any section becomes stale, refresh plan/state before executing more units.

### D) State update rules during execution

After each unit or batch, parent agent updates `state.json` with:

- `status` per unit: `pending | in_progress | completed | failed | blocked`
- Batch progress and next runnable units.
- Failure notes and blockers.
- `last_updated` timestamp.

Do not rely on conversational memory for progress when state exists.

### E) Resume protocol after compaction or restart

On resume, execute this sequence:

1. Reload this skill.
2. Read `plan.md` and `state.json`.
3. Rebuild context strictly from those files.
4. Validate that completed units are still valid.
5. Continue from first incomplete unblocked unit.
6. If user changed direction, update plan/state, then proceed.

Do not re-plan from scratch unless objective or constraints materially changed.

### F) Replan triggers

Replan before further execution if any occurs:

- New user constraints or non-goals.
- Repeated unit failure past retry policy.
- Dependency graph changes.
- New high-priority scope enters run.
- Integration conflicts reveal bad decomposition.

Preserve completed unit IDs and outcomes unless explicitly invalidated.

## Execution workflow

1. Extract objective, constraints, and non-goals from user request.
2. Create or refresh plan/state files.
3. Build unit list and dependency map.
4. Define execution batches and concurrency.
5. Dispatch unit task cards to sub-agents (parallel where safe).
6. Collect and normalize sub-agent outputs.
7. Run integration pass.
8. Run verification gates and final QA.
9. Produce concise final report linked to unit IDs.

## Parallel vs sequential decision rules

Use parallel when:

- Units do not touch shared mutable resources.
- Units are read-only analysis or isolated edits.
- API/tool rate limits permit fan-out.

Use sequential when:

- Units depend on prior outputs.
- Units modify overlapping files or shared state.
- Ordering affects correctness or reproducibility.

Use hybrid by default for large tasks:

- Phase 1: parallel independent units.
- Phase 2: sequential dependency chain.
- Phase 3: sequential integration and QA.

## Sub-agent task card contract

Each dispatched unit must include:

- `unit_id`
- `objective`
- `scope` (exact files/issues/entities)
- `inputs` (relevant context only)
- `must_keep`
- `must_avoid`
- `output_schema`
- `verification`
- `stop_conditions`

Never send a sub-agent a whole-project rewrite request.

## Sub-agent response schema (required)

Require each sub-agent to return:

- `unit_id`
- `status` (`success | partial | failed`)
- `summary`
- `findings_or_changes`
- `artifacts_touched`
- `verification_results`
- `blockers`
- `confidence` (`low | medium | high`)
- `recommended_next_step`

## Integration pass requirements

After all runnable units complete:

- Normalize outputs to a single format.
- Deduplicate overlapping findings.
- Resolve conflicting recommendations using plan tie-break rules.
- Confirm merged output satisfies success criteria.
- Mark unresolved conflicts in state and report explicitly.

Integration should combine validated unit outputs, not restart unit work.

## Failure handling

- Retry transient failures with bounded retries and backoff.
- Continue unaffected units when safe.
- Quarantine failed units with explicit blocker notes.
- Escalate to user only when blockers change scope, safety, or required decisions.

## Final QA checklist

Before declaring done, verify:

- All required units are `completed` or explicitly documented as `failed/blocked`.
- Success criteria are satisfied or gap is clearly explained.
- Constraints and non-goals were respected.
- Integration conflicts are resolved or explicitly surfaced.
- Final summary maps results back to `unit_id` values.

## Example decomposition rule (open GitHub issues)

- One unit per open issue (`unit_id = ISSUE-<number>`).
- Run per-issue analysis sub-agents in parallel.
- Require per-unit output: summary, severity, recommended action, confidence.
- Parent agent dedupes cross-issue themes and produces prioritized rollup.

## Git hygiene for this workflow

Plan/state files are operational memory:

- Keep them only under `.git/opencode-orchestrator/...`.
- Do not stage or commit `.git/` content.
- Commit only user-facing code/docs changes.
