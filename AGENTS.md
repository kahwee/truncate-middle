# Repository guidance

This package exports one zero-runtime-dependency string utility. Read
`src/index.ts` and the existing behavior tests before changing its contract.

- Use pnpm with `pnpm-lock.yaml`; install with `pnpm install --frozen-lockfile`.
  Use the pinned pnpm version in `package.json`. The development Node version in
  `.nvmrc` is distinct from the package's Node 18+ runtime support; tsup 9 needs
  Node 22.18+, 24.11+, or 26+ to build, not to consume the package.
- Preserve default and named ESM exports and both corresponding properties on
  the CommonJS exports object. Verify examples against a fresh build, including
  `require()`; do not assume a default export makes CommonJS directly callable.
- Preserve the literal `&hellip;` default, null/undefined handling, rounded
  lengths, and UTF-16 slicing behavior. Changes to those are API changes.
- Check `pnpm outdated` and `pnpm audit` for greenkeeping. Use Biome for linting
  and formatting; keep Vitest aligned with its coverage package.
- Run lint, typecheck, tests, and build for source or dependency edits. For docs,
  execute changed examples and check links; do not invent redundant unit tests.
- For bundler updates, run `node scripts/test-runtime.mjs` on the supported CI
  runtimes and test the packed tarball in a separate consumer. Keep tsup's output
  target at Node 18 and preserve both module formats and declarations.
- Update `CHANGELOG.md` and the pnpm lockfile with a package version bump. Do not
  tag or publish a prepared version without session authorization.
