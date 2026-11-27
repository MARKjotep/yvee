# Changelog

All notable changes to `yvee` are recorded here.

## Unreleased

### Changed

- The build toolchain now uses the published `@xyrah/oven` ^0.0.3 dev
  dependency instead of the previous linked local build (0.0.1). Oven remains a
  dev-only dependency; no runtime dependency was added.
- `dist/` rebuilt with the published toolchain: the output is byte-identical to
  0.1.7, so no runtime or declaration types changed.
- Dev dependency `@axe-core/playwright` bumped from ^4.14.0 to ^4.14.1.

## 0.1.7 — 2026-11-25

### Added

- Automatic JSX runtime: `.tsx` files need no `dom`/`frag` import. Configure
  `"jsx": "react-jsx"` and `"jsxImportSource": "yvee"`; Bun 1.4+ is recommended
  because its transpiler and `Bun.build` honor the same settings.
- New package exports `yvee/jsx-runtime` (`jsx`, `jsxs`, `Fragment`) and
  `yvee/jsx-dev-runtime` (`jsxDEV`, `Fragment`), with types shipped from
  `dist/index.d.ts`.
- `regionTree` now records level metadata for each `regionLevel`: the view
  rendered by the bare level id and the declared view segments. The flattened
  `Record<string, RegionLoader>` keys are unchanged; read the metadata with the
  new `regionLevelIds(regions)` and `defaultViewFor(regions, regionId)` helpers,
  both exported from the package entry.
- Test coverage for zero-import JSX: a unit-rendering fixture, consumer type
  tests, and a browser fixture/spec that render intrinsics, components,
  fragments and keyed lists without importing `dom`/`frag`.

### Changed

- The classic JSX factories remain fully supported: `"jsx": "react"` with
  `jsxFactory`/`jsxFragmentFactory` and `import { dom, frag } from "yvee"`
  keep working. The component contract is unchanged — `(props, ...children)`,
  children never on `props`, and `key` stays in the attribute object.
- Development builds use the linked `@ohmyqt/oven` 0.0.1 dev dependency, whose
  new `jsx` and `tsconfig` passthrough options select the automatic runtime
  explicitly. Oven is a dev-only dependency; no runtime dependency was added.
