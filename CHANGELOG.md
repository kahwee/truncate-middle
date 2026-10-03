# Changelog

## 2.0.5 (unreleased)

- Replace ESLint and Prettier with Biome.
- Use pnpm for dependency installation, scripts, and GitHub Actions.
- Upgrade to TypeScript 7 and emit declarations with tsc.

## 2.0.4 (unreleased)

- Check built ESM and CommonJS package exports on Node.js 22, 24, and 26 in CI.
- Refresh typescript-eslint to 8.71.0, resolve the brace-expansion advisory, and update GitHub Actions.

## 2.0.3 (unreleased)

- Refresh Vitest and its coverage package to 5.0.2. Keep TypeScript 6 until
  typescript-eslint supports TypeScript 7.
- Refresh Node types to 26.6.3, Prettier to 3.9.9, and typescript-eslint to 8.70.1.

- Correct the CommonJS usage example to destructure the function from the exports object.
- Add file-path and plain-text examples; explain separator length and UTF-16 boundaries.
- Consolidate agent guidance in AGENTS.md.

## Unreleased

### Maintenance

- CI and `.nvmrc` target Node.js 26.x (package still supports Node.js 18+)
- Dev dependency patch bumps: `@types/node`, `eslint`, `prettier`

## 2.0.1 (2025-05-08)

### Improvements

- Updated CI pipeline to use Node.js v20.x and v22.x (later moved to 26.x)
- Updated `@types/node` to version 22.x
- Patch version bump for maintenance updates

## 2.0.0 (2025-03-01)

### Breaking Changes

- Converted to ES Modules
- TypeScript rewrite
- Changed export format (now a default export)
- Minimum Node.js version is now 18
- Handle undefined values the same as null

### Features

- Added TypeScript types
- Support for both ESM and CommonJS
- Improved build system using tsup
- Added decimal parameter handling
- Switched from Mocha to Vitest for testing

## 1.0.6

- Updated dependencies

## v1.0.4 (2016-06-16)

- Formatting and dev Dependencies changes
- No logic change.

## v1.0.2 (2015-03-24)

- Better readme.

## v1.0.1 (2015-03-11)

- Add travis and coverage, also their badges
