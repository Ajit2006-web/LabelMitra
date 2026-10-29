# AGENTS.md

## General Instructions for Any New AI Coding Agent

1. **Read the documentation first** – before making any changes, open and review:
   - `PROJECT_CONTEXT.md`
   - `TASK_TRACKER.md`
   - `CHANGELOG.md`
   - `HANDOFF_PROMPT.md`
2. **Do NOT rebuild or replace existing functionality** unless you have a documented justification approved by the project owner. The architecture, naming conventions, and design tokens are fixed.
3. **Respect existing conventions**:
   - Follow the folder layout (`client/src/...`, `server/src/...`).
   - Use the design system defined in `docs/DESIGN_SYSTEM.md` for any UI work.
   - Follow existing Prisma models and Express middleware patterns.
4. **Testing is mandatory** – after any code change:
   - Add or update Jest/Supertest tests for backend.
   - Add or update React Testing Library tests for frontend components.
   - Run the full test suite (`npm test`) and ensure all pass before committing.
5. **Update documentation** – whenever a feature is completed or a bug is fixed, immediately:
   - Append an entry to `CHANGELOG.md` with a short description, affected files, and test verification.
   - Update the relevant sections in `PROJECT_CONTEXT.md` or `TASK_TRACKER.md`.
6. **Environment & Secrets** – never commit any secret values. Use the `.env` file (ignored by git) and access via `config/env.js`.
7. **Commit style** – use clear, prefixed commit messages, e.g., `feat(scan): connect ScanPage UI to upload endpoint`.
8. **When in doubt** – ask the project owner or refer to the design docs before making architectural changes.

---
*Generated on 2026‑10‑16.*
