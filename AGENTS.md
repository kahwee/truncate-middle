# Repository guidance

This package exports zero-runtime-dependency string truncation utilities. Read
`src/index.ts`, `src/graphemes.ts`, and the behavior tests before changing a contract.

- Use pnpm with `pnpm-lock.yaml`; install with `pnpm install --frozen-lockfile`.
  Use the pinned pnpm version in `package.json`. The development Node version in
  `.nvmrc` is distinct from the package's Node 18+ runtime support; tsup 9 needs
  Node 22.18+, 24.11+, or 26+ to build, not to consume the package.
- Preserve default and named ESM exports and both corresponding properties on
  the CommonJS exports object. Verify examples against a fresh build, including
  `require()`; do not assume a default export makes CommonJS directly callable.
- Preserve the literal `&hellip;` default, null/undefined handling, rounded
  lengths, and UTF-16 slicing behavior of `truncateMiddle`; its default export
  must not silently become grapheme-aware. The opt-in `truncateMiddleGraphemes`
  requires `Intl.Segmenter`, rejects invalid lengths, and never falls back to slicing.
- Check `pnpm outdated` and `pnpm audit` for greenkeeping. Use Biome for linting
  and formatting; keep Vitest aligned with its coverage package.
- Run lint, typecheck, tests, and build for source or dependency edits. For docs,
  execute changed examples and check links; do not invent redundant unit tests.
- For bundler updates, run `node scripts/test-runtime.mjs` on the supported CI
  runtimes and `pnpm run test:package` for a clean installed consumer. Keep tsup's output
  target at Node 18 and preserve both module formats and declarations.
- Generate CommonJS declarations from the TypeScript output; do not maintain
  handwritten copies. Keep import/require type conditions aligned with their formats.
- Keep detailed API contracts in the packed `docs/api.md`; keep the README short.
- Update `CHANGELOG.md` and the pnpm lockfile with a package version bump. Do not
  tag or publish a prepared version without session authorization.
