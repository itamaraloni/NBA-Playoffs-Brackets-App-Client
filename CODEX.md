# Client Codex Working Agreement

This file contains Codex-specific execution rules for the client repo.

Read this together with:
- `../CODEX.md` for the root Codex contract
- `CLAUDE.md` for frontend architecture, patterns, and workflow

## Approval Boundary

- Ask the user before running `git commit`
- Ask the user again before running `git push`
- Do not treat a staged diff, passing build, or "looks ready" state as implicit approval

## UI Diff Discipline

- Keep UI changes narrowly scoped when the task can be sliced into smaller visible behaviors
- If a frontend pass grows across many files, pause and confirm what stays in the active diff versus what should be stashed
- Separate structural UI fixes from broad terminology or copy sweeps unless the user explicitly wants them bundled

## Frontend Review Expectations

- For visible UI changes, explain the before/after behavior in user-facing terms
- Call out whether desktop, mobile, or both were actually verified
- When a shared component change affects multiple pages, mention the affected surfaces explicitly

## Current User Preference

- The user wants an explicit approval checkpoint before any `git commit` or `git push` in this client repo
