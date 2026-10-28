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
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const graphemes = Array.from(segmenter.segment(str), ({ segment }) => segment);

  if ((frontLength === 0 && backLength === 0) || frontLength + backLength >= graphemes.length) {
    return str;
  }
  const front = graphemes.slice(0, frontLength).join("");
  const back = backLength === 0 ? "" : graphemes.slice(-backLength).join("");
  return front + truncateStr + back;
}
