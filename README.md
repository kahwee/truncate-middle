# truncate-middle

Truncates strings in the middle. Useful when important information is at both the beginning and end of the string.

[![npm version](https://badge.fury.io/js/truncate-middle.svg)](http://badge.fury.io/js/truncate-middle)
[![CI](https://github.com/kahwee/truncate-middle/actions/workflows/ci.yml/badge.svg)](https://github.com/kahwee/truncate-middle/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/kahwee/truncate-middle/branch/master/graph/badge.svg)](https://codecov.io/gh/kahwee/truncate-middle)

## Example use case

```js
const book =
  "America Again: Re-becoming the Greatness We Never Weren't by Stephen Colbert (978-0446583978)";
import truncateMiddle from "truncate-middle";
const display = truncateMiddle(book, 30, 16, "...");
// You get 'America Again: Re-becoming the...(978-0446583978)'
```

## Installation

```sh
# npm
npm install truncate-middle

# yarn
yarn add truncate-middle

# pnpm
pnpm add truncate-middle
```

## Usage

### ESM (recommended)

```js
import truncateMiddle from "truncate-middle";

// Basic usage
truncateMiddle("the quick brown", 5, 3, "...");
// => 'the q...own'
```

### CommonJS

```js
const truncateMiddle = require("truncate-middle");

// Basic usage
truncateMiddle("the quick brown", 5, 3, "...");
// => 'the q...own'
```

### Examples

Default behavior (no truncation):

```js
truncateMiddle("the quick brown");
// => 'the quick brown'
```

Specifying a front length of 5:

```js
truncateMiddle("the quick brown", 5);
// => 'the q&hellip;'
```

Specifying a front length of 5 and back length of 3:

```js
truncateMiddle("the quick brown", 5, 3);
// => 'the q&hellip;own'
```

When the string is short enough that no truncation is needed:

```js
truncateMiddle("the quick brown", 50, 50);
// => 'the quick brown'
```

## API

### truncateMiddle(str, frontLen, backLen, truncateStr)

| Parameter   | Type                        | Description                                | Default    |
| ----------- | --------------------------- | ------------------------------------------ | ---------- |
| str         | string \| null \| undefined | String to be truncated                     | -          |
| frontLen    | number                      | Number of characters to keep at the front  | 0          |
| backLen     | number                      | Number of characters to keep at the back   | 0          |
| truncateStr | string                      | String that replaces the truncated portion | '&hellip;' |

Returns: The truncated string.

## License

MIT
