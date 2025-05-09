/**
 * There are cases where important information is at the end of the string and truncating the end isn't helpful.
 * This function solves that.
 *
 * @param str - String to be truncated
 * @param frontLen - Number of characters to be remained in front
 * @param backLen - Number of characters to be remained at the back
 * @param truncateStr - String that replaces the truncated portion
 * @returns Truncated string. Defaults to '&hellip;' if unspecified
 */
export function truncateMiddle(
  str: string | null | undefined,
  frontLen: number = 0,
  backLen: number = 0,
  truncateStr: string = "&hellip;"
): string {
  if (str === null || str === undefined) {
    return "";
  }

  const strLen = str.length;
  // Round to nearest integer instead of floor to fix decimal parameter test
  const frontLength = Math.round(frontLen);
  const backLength = Math.round(backLen);

  if (
    (frontLength === 0 && backLength === 0) ||
    frontLength >= strLen ||
    backLength >= strLen ||
    frontLength + backLength >= strLen
  ) {
    return str;
  } else if (backLength === 0) {
    return str.slice(0, frontLength) + truncateStr;
  } else {
    return str.slice(0, frontLength) + truncateStr + str.slice(strLen - backLength);
  }
}

// For backwards compatibility with default import
export default truncateMiddle;
