# truncate-middle

Keep both ends of a string while shortening its middle. Zero runtime dependencies;
ESM, CommonJS, and TypeScript types; Node.js 24+.

```sh
npm install truncate-middle
```

## Use

```js
import truncateMiddle from "truncate-middle";

truncateMiddle("reports/2026/september/invoice.pdf", 8, 11, "…");
// => "reports/…invoice.pdf"
```

The default API counts UTF-16 code units, preserving its existing behavior.
For complete emoji and combined characters, **3.0.0 (unreleased candidate)** adds an opt-in API:

```js
import { truncateMiddleGraphemes } from "truncate-middle";

truncateMiddleGraphemes("👩‍💻abcdef🇸🇬", 1, 1, "…");
// => "👩‍💻…🇸🇬"
```

The opt-in API requires `Intl.Segmenter`; it never silently falls back to UTF-16.
Both APIs default to the literal separator `"&hellip;"`. See the packed
[API reference](docs/api.md) for bounds, nullish inputs, CommonJS examples,
and migration guidance.

## Develop

Use Node.js 26 and the pinned pnpm 12.15.0; the built package supports Node 24+.

```sh
pnpm install --frozen-lockfile
pnpm run lint && pnpm run typecheck && pnpm run coverage && pnpm run build
node scripts/test-runtime.mjs
pnpm run test:package
```

[Contributing guidance](https://github.com/kahwee/truncate-middle/blob/main/AGENTS.md) ·
[CI and releases](https://github.com/kahwee/truncate-middle/blob/main/.github/ACTIONS.md) ·
[Changelog](CHANGELOG.md) · MIT license
