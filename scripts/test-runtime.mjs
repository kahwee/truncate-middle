import assert from "node:assert/strict";
import { createRequire } from "node:module";
import defaultTruncateMiddle, { truncateMiddle } from "truncate-middle";

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
