---
"@blode/edda": major
"@blode/edda-dev": major
---

**Breaking:** the published CLI is now `@blode/edda` (bin `edda`). The previous unscoped `blodemd` package name is retired because `edda` is taken on npm. Install with `npm i -g @blode/edda`. The `blodemd` binary remains as a compatibility alias.

The companion dev-server package is now `@blode/edda-dev` (bins `edda-dev` and `blodemd-dev`).

`EDDA_API_KEY`, `EDDA_PROJECT`, `EDDA_API_URL`, `EDDA_BRANCH`, and `EDDA_COMMIT_MESSAGE` are the documented environment variables. The previous `BLODEMD_*` names still work.
