## Backend Structure

This backend is split by responsibility so the most complicated pieces do not collapse into `server.mjs`.

### Folders

- `src/config`
  Runtime config and environment parsing.
- `src/http`
  Route handlers and API wiring.
- `src/modules/ingestion`
  CSV/file parsing, header normalization, and import preparation.
- `src/modules/validation`
  Schema rules, field rules, and validation orchestration.
- `src/modules/dedupe`
  Exact and fuzzy duplicate detection.
- `src/modules/reporting`
  Report formatting, summaries, and export shaping.
- `src/modules/jobs`
  Background validation jobs and job-state handling.
- `src/modules/issues`
  Issue actions such as review, ignore, resolve, and audit trail support.
- `src/shared`
  Shared contracts and small reusable utilities.

### Suggested Build Order

1. Move request parsing and route handlers into `src/http/routes`.
2. Move CSV normalization into `src/modules/ingestion`.
3. Move validation orchestration into `src/modules/validation`.
4. Move duplicate detection into `src/modules/dedupe`.
5. Add issue action persistence and reporting.
