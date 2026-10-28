# API reference

Both functions keep a prefix and suffix and insert a separator between them.
The retained lengths do **not** include the separator and are not a maximum output length.
The package has no runtime dependencies and supports Node.js 24+.

## Migrating to 3.0.0

Node.js consumers must upgrade to Node 24 or newer. The default UTF-16 API and
existing exports retain their behavior; the grapheme API is opt-in and requires
`Intl.Segmenter`. The browser output target is unchanged. This is a candidate,
not a published release.

## Existing UTF-16 API

`truncateMiddle(str, frontLen = 0, backLen = 0, truncateStr = "&hellip;")`

- `str` is a string; `null` and `undefined` return `""`.
- `frontLen` and `backLen` count UTF-16 code units. Use finite nonnegative numbers;
  fractional lengths are rounded with `Math.round`.
- Both rounded lengths being zero returns the original string. If either length,
  or their sum, covers the input, the original string is also returned.
- A zero suffix retains only the prefix and separator; a zero prefix retains only
  the separator and suffix, unless both are zero.
- `truncateStr` is inserted literally. The default `"&hellip;"` is text, not an
  automatic Unicode ellipsis. Pass `"…"`, `"..."`, or `""` for plain-text output.

The default function is unchanged in 3.0.0, including its historical behavior for
inputs outside the recommended bounds. It does not validate bounds or normalize text.
UTF-16 slicing can split surrogate pairs or combining sequences:

```js
import truncateMiddle from "truncate-middle";

truncateMiddle("the quick brown", 5, 3, "..."); // "the q...own"
truncateMiddle("the quick brown", 5); // "the q&hellip;"
truncateMiddle("the quick brown", 5, 0, "…"); // "the q…"
truncateMiddle("short", 5, 3, "…"); // "short"
truncateMiddle(null, 5, 3, "…"); // ""
truncateMiddle("😀abcd", 1, 1, "…"); // "\ud83d…d" (split surrogate)
```

## Opt-in grapheme API (3.0.0 candidate)

`truncateMiddleGraphemes(str, frontLen = 0, backLen = 0, truncateStr = "&hellip;")`

The same arguments count **grapheme clusters** rather than UTF-16 code units.
Segmentation uses `Intl.Segmenter` with `granularity: "grapheme"` and the host's
locale and Unicode data. ZWJ emoji, regional-indicator flags, and combining marks
remain together. The original code units are retained; no normalization is applied.
Unicode segmentation can differ between runtime versions. Grapheme counts are not
terminal column counts, rendered widths, or byte counts.

The contract is deliberately explicit:

1. `null` and `undefined` return `""` immediately, before bounds or availability checks.
2. Other non-string inputs throw `TypeError`; they are not coerced.
3. Both lengths must be finite nonnegative numbers, or `RangeError` is thrown.
   Validation precedes rounding: `-0.1` is invalid, while `-0` is accepted as zero.
4. Every non-nullish string requires `Intl.Segmenter`, even an empty string or a
   no-op call. If unavailable, an `Error` explains the requirement. There is no
   UTF-16 fallback or bundled polyfill. The original API remains usable without it.
5. Lengths are rounded with `Math.round`: `0.49` becomes zero and `0.5` becomes one.
   Both-zero and overlapping/full-length retention return the original string.
   Otherwise, prefix and suffix are joined with the literal separator.

```js
import { truncateMiddleGraphemes } from "truncate-middle";

truncateMiddleGraphemes("👩‍💻abcdef🇸🇬", 1, 1, "…"); // "👩‍💻…🇸🇬"
truncateMiddleGraphemes("e\u0301abcdefa\u0308", 1, 1, "…"); // "e\u0301…a\u0308"
truncateMiddleGraphemes("😀ab🚀", 0.5, 0.5, "…"); // "😀…🚀"
truncateMiddleGraphemes("😀ab🚀", 2, 2, "…"); // "😀ab🚀"
truncateMiddleGraphemes("😀ab🚀", 0, 0, "…"); // "😀ab🚀"
truncateMiddleGraphemes("😀ab🚀", 0, 1, "…"); // "…🚀"
```

The host feature is available in standard tested Node 24/26 builds;
custom Intl builds and older browsers may lack it. Feature-detect
`typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"` when needed.
See [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
and the [ECMA-402 specification](https://tc39.es/ecma402/#segmenter-objects).

## Module formats

The default and named `truncateMiddle` exports are the same function. The grapheme
API is named-only; it does not replace the default.

```js
import truncateMiddle, { truncateMiddleGraphemes } from "truncate-middle";
```

CommonJS returns an exports object, not a directly callable function:

```js
const { truncateMiddle, truncateMiddleGraphemes } = require("truncate-middle");

truncateMiddle("the quick brown", 5, 3, "..."); // "the q...own"
truncateMiddleGraphemes("🇸🇬abcdef🇺🇸", 1, 1, "…"); // "🇸🇬…🇺🇸"
```

`require("truncate-middle").default` remains identical to its `truncateMiddle`
property. Both APIs accept `string | null | undefined` and return `string` in the
shipped declarations; consumers do not need the Intl TypeScript library to type-check calls.
