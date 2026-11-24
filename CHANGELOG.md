# Changelog

All notable changes to `yvee` are recorded here.

## Unreleased

### Added

- `regionTree` now records level metadata for each `regionLevel`: the view
  rendered by the bare level id and the declared view segments. The flattened
  `Record<string, RegionLoader>` keys are unchanged; read the metadata with the
  new `regionLevelIds(regions)` and `defaultViewFor(regions, regionId)` helpers,
  both exported from the package entry.

The package version remains `0.1.6`; this entry ships with the next release.
