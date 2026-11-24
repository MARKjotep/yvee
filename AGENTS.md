# OpenCode Development Workflow

Use only configured OpenCode agents. `build` plans, delegates, integrates and verifies read-only. Maximum **4 active child workers total**, excluding `build`. Only `code` writes source, tests, task files and persistent reports.

## Roles and routing

| Agent | Responsibility |
|---|---|
| `build` | GLM Flash: orchestration and final verification |
| `code` | DeepSeek high: implementation, fixes, unit/integration tests and file writes |
| `ui` | GLM Flash: HTML semantics, CSS, UI/UX, responsive layout, accessibility and interaction decisions |
| `browser_test` | GLM Flash: Playwright, rendered DOM, browser behavior and regression validation |
| `advisor` | GLM high: blocked architecture decisions |
| `evaluate` / `review` | GLM 5.3 high: complex tradeoffs / substantial change review |
| `explore` / `sanity_check` | MiMo: targeted exploration / quick checks |
| `research` / `vision` | DeepSeek: external documentation / GLM 5.3: visual inspection when supported |

- Backend or logic work → `code`. New or materially changed UI → `ui` specifies design and acceptance criteria, `code` implements, `browser_test` verifies actual rendering.
- Route browser failures to `browser_test` for diagnosis, `code` for fixes, then `browser_test` for retesting. Persistent Playwright test files are written by `code` from GLM's scenarios.
- GLM owns UI decisions within user requirements; `build` resolves conflicts. Specialists return findings to `build`; only `code` persists them. No recursive delegation.

## Workspace

Keep `AGENTS.md` and `opencode.jsonc` at root. Keep `.ai/` root free of files.

- `.ai/agents/`: OpenCode presets; `.ai/plans/`: project plans.
- `.ai/tasks/`: unique task prompts; `.ai/reports/`: reports, progress and archives; `.ai/reports/logs/`: worker logs.
- `.ai/framework/`: framework-specific bug and feature records, organized as `Rossa/`, `Yvee/`, `Shweet/`, each with `bugs/` and `features/`.
- Create framework records only for relevant framework defects or feature requests, not ordinary application issues. Use unique descriptive filenames; include summary, framework, affected API and mandatory framework version, reproduction or use case, expected/actual behavior (bugs), acceptance criteria (features), evidence, workaround if any, and status. Verify the exact installed framework version from package metadata or the resolved lockfile (not a version range). If unavailable, record `Framework version: unknown` and explain why; never guess. Include versions for all affected frameworks. Update existing records rather than duplicating. Cross-link related records and task reports. Do not modify framework dependencies or upstream repositories without authorization.

## Execution and handoff

Start coordinated work:
```sh
opencode run --agent build --model opencode-go/glm-5.3-flash "Coordinate the requested work using the configured specialists."
```

Standalone implementation:
```sh
opencode run --agent code --model 'opencode-go/deepseek-v4.1-flash#high' "Read .ai/tasks/TASK-N.md; implement, validate and write .ai/reports/REPORT-N.md."
```

- Pin models on CLI runs. Prefer configured subagents for coordinated work.
- Each prompt starts with `## Summary` (2–4 plain-language bullets shown before implementation), then objective, relevant/allowed files, dependencies, constraints, acceptance criteria and validation commands. Repeat summary in reports.
- Schedule independent tasks immediately when slots free; never exceed four active children across all roles. Do not wait for a whole batch. Respect dependencies and exclusive file ownership, including generated files, dependencies and build artifacts.
- Split work expected to exceed ~10 minutes into independently verifiable stages. Reuse worker session IDs for follow-ups where supported; avoid repeated polling and exploration.
- Use unique task/report/log paths. Capture worker logs where supported. `## Handoff` for staged work: completed state, validation, remaining steps and touched files. Transfer ownership only after completion/abandonment; record transfer.
- Collect worker statuses, changed files, evidence and blockers before final review. Limit automatic correction attempts to two per task. Preserve unrelated changes; never commit or push without user authorization.

## Browser and UI validation

- Use actual rendered DOM and existing Playwright tooling. Prefer role/label locators, deterministic assertions and auto-waiting; avoid fixed sleeps.
- Verify affected interactions, responsive viewports, accessibility, overflow, loading/empty/error/success states, console and failed requests as relevant.
- Inspect relevant DOM subtrees; capture screenshots/traces only when useful. Use `vision` only if needed and supported.
- Report pass/fail, reproduction, evidence and suspected cause. Never weaken assertions to pass. If browser execution is unavailable, mark unverified, not passed.
- Frontend work is complete only after approved UI requirements and relevant browser acceptance checks pass.

## Efficiency

Default to DeepSeek for implementation. Skip UI specialists for backend-only work; reuse approved UI specs for routine changes. Batch related browser checks, retest affected scenarios first, then run required regression checks. Keep prompts/reports concise, avoid redundant reviews and trivial delegation, and escalate only when blocked.

## Plans and progress

Use 🟢 complete, 🟡 partial/in progress, 🔴 open/blocked, ⚪ not applicable. Each implementation plan has one near-top `## Implementation Progress` table: phase/item, deliverable, acceptance condition, status. Update as work changes; mark complete only after verification.

## Project build and source rules

- Use `bun run builder/html_builder.ts` for client builds and Playwright; it bundles `client/` via `@ohmyqt/oven` and `builder/client_builder.ts`, and generates test HTML. Playwright `webServer` runs it automatically. No ad-hoc `bun build` or `tsc` substitute; report missing builder as blocker.
- Keep TypeScript modular; split unrelated logic and large lookup families into focused modules with small facades as useful. Preserve public imports, keys, behavior and type inference.
- Add concise user-oriented JSDoc to public Tally chain/configuration types (utilities, indexed scales, variants, colors, `MEDIA`, `configure`); prefer mapped-type docs over repetitive declarations.
