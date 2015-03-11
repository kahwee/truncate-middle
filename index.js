'use strict';
module.exports = function(str, frontLen, backLen, truncateStr) {
	if (str === null) {
		return '';
	}
	var strLen = str.length;
	// Setting default values
	frontLen = ~~frontLen; // will cast to number
	backLen = ~~backLen;
	truncateStr = truncateStr || '&hellip;';
	if (frontLen === 0 && backLen === 0 || frontLen >= strLen || backLen >= strLen || (frontLen + backLen) >= strLen) {
		return str;
	} else if (backLen === 0) {
		return str.slice(0, frontLen) + truncateStr;
	} else {
		return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen);
	}
};
