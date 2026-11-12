/**
 * Truncate between complete grapheme clusters using the host's Intl.Segmenter.
 * Nullish inputs return "". Lengths must be finite and nonnegative, and are rounded.
 * Requires Intl.Segmenter for every non-nullish input; never falls back to UTF-16.
 */
export function truncateMiddleGraphemes(
  str: string | null | undefined,
  frontLen: number = 0,
  backLen: number = 0,
  truncateStr: string = "&hellip;"
): string {
  if (str === null || str === undefined) {
    return "";
  }
  if (typeof str !== "string") {
    throw new TypeError("truncateMiddleGraphemes expects a string, null, or undefined");
  }
  if (!Number.isFinite(frontLen) || frontLen < 0 || !Number.isFinite(backLen) || backLen < 0) {
    throw new RangeError("Grapheme lengths must be finite, nonnegative numbers");
  }
  if (typeof Intl === "undefined" || Intl === null || typeof Intl.Segmenter !== "function") {
    throw new Error("truncateMiddleGraphemes requires Intl.Segmenter");
  }

  const frontLength = Math.round(frontLen);
  const backLength = Math.round(backLen);
  if (frontLength === 0 && backLength === 0) {
    return str;
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const segments = segmenter.segment(str);
  let frontEnd = 0;
  let retained = 0;
  for (const { index, segment } of segments) {
    if (retained === frontLength) break;
    frontEnd = index + segment.length;
    retained++;
  }
  if (frontEnd === str.length) return str;

  // Walk backwards by complete clusters instead of allocating every cluster.
  let backStart = str.length;
  for (let count = 0; count < backLength; count++) {
    const tail = segments.containing(backStart - 1);
    if (!tail) return str;
    backStart = tail.index;
    if (backStart <= frontEnd) return str;
  }
  return str.slice(0, frontEnd) + truncateStr + str.slice(backStart);
}
