# truncate-middle

Keep both ends of a string while shortening its middle. Useful for file paths,
identifiers, and titles whose suffix still matters.

[![npm version](https://badge.fury.io/js/truncate-middle.svg)](https://www.npmjs.com/package/truncate-middle)
[![CI](https://github.com/kahwee/truncate-middle/actions/workflows/ci.yml/badge.svg)](https://github.com/kahwee/truncate-middle/actions/workflows/ci.yml)

## Install

```sh
npm install truncate-middle
```

The package supports Node.js 18+ and ships ESM, CommonJS, and TypeScript types.

## Use

```js
import truncateMiddle from "truncate-middle";

truncateMiddle("reports/2026/september/invoice.pdf", 8, 11, "…");
// => 'reports/…invoice.pdf'

truncateMiddle("the quick brown", 5, 3, "...");
// => 'the q...own'

truncateMiddle("short", 5, 3, "…");
// => 'short'

truncateMiddle(null, 5, 3, "…");
// => ''
```

A named ESM import is also available:

```js
import { truncateMiddle } from "truncate-middle";
```

For CommonJS, destructure the named export. `require()` returns an exports object,
not the function itself:

```js
const { truncateMiddle } = require("truncate-middle");

truncateMiddle("the quick brown", 5, 3, "...");
// => 'the q...own'
```

The same function is also available as `require("truncate-middle").default`.

## API

`truncateMiddle(str, frontLen = 0, backLen = 0, truncateStr = "&hellip;")`

| Argument      | Meaning                                                          |
| ------------- | ---------------------------------------------------------------- |
| `str`         | String to shorten; `null` and `undefined` return an empty string |
| `frontLen`    | Number of UTF-16 code units to keep at the beginning             |
| `backLen`     | Number of UTF-16 code units to keep at the end                   |
| `truncateStr` | Text inserted between the retained parts                         |

Use nonnegative finite lengths. Fractional lengths are rounded with `Math.round`.
If both lengths are zero, or the retained lengths cover the input, the original
string is returned. The separator is additional to the two retained lengths;
these arguments do not specify a maximum output length.

The default separator is the literal text `&hellip;`. For plain text, React, or
terminal output, pass `"…"` or `"..."` explicitly:

```js
import truncateMiddle from "truncate-middle";

truncateMiddle("the quick brown", 5);
// => 'the q&hellip;'

truncateMiddle("the quick brown", 5, 0, "…");
// => 'the q…'
```

Lengths follow JavaScript string slicing, so a boundary can split an emoji or a
combined character. This utility does not perform grapheme-aware truncation.

## Develop

Use the development Node version in `.nvmrc` and the committed pnpm lockfile:

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
node scripts/test-runtime.mjs
```

Use `pnpm run coverage` for the coverage report. Source is in `src/index.ts`, tests
in `test/index.test.ts`, and release notes in [CHANGELOG.md](CHANGELOG.md).
CI builds with Node.js 26 and checks the built ESM and CommonJS exports with
Node.js 22, 24, and 26, without installing development tools in the runtime jobs.
Node.js 18 remains the declared runtime minimum; it is not currently verified by CI.

## License

MIT
