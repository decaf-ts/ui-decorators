# Session Context — ui-decorators

## Current Focus

Global AI config refactor — migrating duplicated agent content into reusable skills.

## Active Decisions

- `typescript-patterns` skill is the single source of truth for TS conventions (naming, DI, docs, ESLint)
- Agents reference the skill via pointer instead of repeating the rules
- `decaf-angular-expert` and `ionic-angular-expert` updated to point to `typescript-patterns`
- Documentation always follows prompts in `<global-ai>/prompts/documentation/typescript/`

## Active TODOs

- Review and execute `skills-refactor` spec: `<global-ai>/specs/skills-refactor/skills-refactor-plan.md`
  - 5 high-priority skills to create (harness-validation-sequences, checkpointing-rules, auth-filter-patterns, psr-standards-enforcement, api-response-envelope)
  - 5 medium-priority skills to create (ionic-capacitor-rules, php-version-migration-guide, responsive-accessibility-checklist, migration-task-sequencing, ui-decorator-conventions)

## Blockers

*(none)*

## Task Progress Log

| Date | Task | Status |
|---|---|---|
| 2026-06-19 | Project Claude initialization (claude-init spec) | DONE |
| 2026-06-19 | Transform DecafRouter.ts into interface | DONE |
| 2026-06-19 | Transform IDecafSpinner.ts and IDecafToast.ts into interfaces | DONE |
| 2026-06-19 | Add Documentation section to typescript-patterns skill | DONE |
| 2026-06-19 | Migrate ESLint + Documentation rules from agents to typescript-patterns | DONE |
| 2026-06-19 | Analyze all agents for skills refactor opportunities | DONE |
| 2026-06-19 | Create skills-refactor spec and plan | DONE |

## Compaction Log

*(none)*
