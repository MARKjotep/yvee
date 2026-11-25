/**
 * Public `yvee/jsx-runtime` entrypoint.
 *
 * The implementation lives in `src/yvee/jsx-runtime.ts`; this top-level facade
 * lets the build emit `dist/jsx-runtime.js` beside `dist/index.js` while both
 * entries share one bundled instance of the renderer (no duplicate `DOM`
 * class across modules).
 */
export * from "./yvee/jsx-runtime";
