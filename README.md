## truncate-middle

There are cases where important information is at the end of the string and truncating the end isn't helpful.

[![Build Status](https://travis-ci.org/kahwee/truncate-middle.svg?branch=master)](https://travis-ci.org/kahwee/truncate-middle) [![Coverage Status](https://coveralls.io/repos/kahwee/truncate-middle/badge.svg?branch=master)](https://coveralls.io/r/kahwee/truncate-middle?branch=master)

## Example use cases

```js
var book1 = "America Again: Re-becoming the Greatness We Never Weren't by Stephen Colbert (978-0446583978)";
var truncateMiddle = require('truncate-middle');
var display = truncateMiddle(book1, 30, 16, '...');
// You get 'America Again: Re-becoming the...(978-0446583978)'
```

## Usage
Install from `npm`.

```sh
npm install --save truncate-middle
```

Requiring in JavaScript

```js
var truncateMiddle = require('truncate-middle');
truncateMiddle('the quick brown', 5, 3, '...');
// Result:
//  'the q...own'
```

Defaults:


```js
truncateMiddle('the quick brown');
// Result:
//  'the quick brown'
```

Specifying a front length of 5:

```js
truncateMiddle('the quick brown', 5);
// Result:
//  'the q&hellip;'
```

Specifying a front length of 5 and back length of 3:

```js
truncateMiddle('the quick brown', 5, 3);
// Result:
//  'the q&hellip;own'
```

When there isn't anything to truncate:

```js
truncateMiddle('the quick brown', 50, 50);
// Result:
//  'the quick brown'
```

## License

MIT
