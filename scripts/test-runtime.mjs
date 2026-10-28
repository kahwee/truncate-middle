import assert from "node:assert/strict";
import { createRequire } from "node:module";
import defaultTruncateMiddle, { truncateMiddle, truncateMiddleGraphemes } from "truncate-middle";

const require = createRequire(import.meta.url);
const commonjs = require("truncate-middle");

assert.equal(defaultTruncateMiddle, truncateMiddle);
assert.equal(commonjs.default, commonjs.truncateMiddle);

for (const fn of [truncateMiddle, commonjs.truncateMiddle]) {
  assert.equal(fn("reports/2026/september/invoice.pdf", 8, 11, "…"), "reports/…invoice.pdf");
  assert.equal(fn("the quick brown", 5, 3, "..."), "the q...own");
  assert.equal(fn("short", 5, 3, "…"), "short");
  assert.equal(fn(null), "");
  assert.equal(fn(undefined), "");
  assert.equal(fn("the quick brown", 5), "the q&hellip;");
  assert.equal(fn("the quick brown", 3.7, 4.2, "..."), "the ...rown");
  assert.equal(fn("😀abcd", 1, 1, "…"), "\ud83d…d");
}

for (const fn of [truncateMiddleGraphemes, commonjs.truncateMiddleGraphemes]) {
  assert.equal(fn("👩‍💻abcdef👨‍👩‍👧‍👦", 1, 1, "…"), "👩‍💻…👨‍👩‍👧‍👦");
  assert.equal(fn("🇸🇬abcdef🇺🇸", 1, 1, "…"), "🇸🇬…🇺🇸");
  assert.equal(fn("e\u0301abcdefa\u0308", 1, 1, "…"), "e\u0301…a\u0308");
  assert.equal(fn("😀ab🚀", 1, 1), "😀&hellip;🚀");
  assert.equal(fn("😀ab🚀", 0, 1, "…"), "…🚀");
  assert.equal(fn("😀ab🚀", 1, 0, "…"), "😀…");
  assert.equal(fn("😀ab🚀", 1, 1, ""), "😀🚀");
  assert.equal(fn("😀ab🚀", 0.5, 0.5, "…"), "😀…🚀");
  assert.equal(fn("😀ab🚀", 2, 2, "…"), "😀ab🚀");
  assert.equal(fn("😀ab🚀", 3, 2, "…"), "😀ab🚀");
  assert.equal(fn("😀ab🚀", 0, 0), "😀ab🚀");
  assert.equal(fn(""), "");
  assert.equal(fn(null), "");
  assert.equal(fn(undefined), "");
  assert.throws(() => fn("abc", -0.1, 1), RangeError);
  assert.throws(() => fn("abc", 1, Number.NaN), RangeError);
  assert.throws(() => fn("abc", Number.POSITIVE_INFINITY, 1), RangeError);
}

const originalIntl = globalThis.Intl;
try {
  globalThis.Intl = undefined;
  for (const fn of [truncateMiddleGraphemes, commonjs.truncateMiddleGraphemes]) {
    assert.throws(() => fn("😀ab🚀", 1, 1), /requires Intl\.Segmenter/);
    assert.equal(fn(null, Number.NaN), "");
  }
  assert.equal(truncateMiddle("😀abcd", 1, 1, "…"), "\ud83d…d");
  assert.equal(commonjs.truncateMiddle("😀abcd", 1, 1, "…"), "\ud83d…d");
} finally {
  globalThis.Intl = originalIntl;
}
