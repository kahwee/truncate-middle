/**
 * There are cases where important information is at the end of the string and truncating the end isn't helpful.
 * This function solves that.
 *
 * @param  {string} str         String to be truncated
 * @param  {number} frontLen    Number of characters to be remained in front.
 * @param  {number} backLen     Number of characters to be remained at the back.
 * @param  {string} truncateStr String that is replaced the truncated portion
 * @return {string}             Truncated string. Defaults to '&hellip;' if unspecified.
 */
export default function truncateMiddle(str, frontLen = 0, backLen = 0, truncateStr = "&hellip;") {
  if (str === null || str === undefined) {
    return "";
  }

  const strLen = str.length;
  // Ensure integers
  const frontLength = Math.floor(frontLen);
  const backLength = Math.floor(backLen);

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
