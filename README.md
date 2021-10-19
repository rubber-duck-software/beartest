# BearTest

![BearTest Bear](https://beartest-js.s3.amazonaws.com/beartest-logo.png)

_Beartest_ is an extremely simple JavaScript test runner inspired by Baretest and Jest. It has a tiny footprint while maintaining a familiar API.

## Install

```sh
npm install --save-dev beartest-js
```

```sh
yarn add beartest-js -D
```

## Why Beartest?

Jest, Mocha, and similar testing frameworks are richly featured, broadly compatible, and highly customizable. Beartest is none of those things. **If you want features look somewhere else.** Beartest is meant to be simple and understandable, without the complexity of other testing frameworks. Inspired by [Baretest](https://www.npmjs.com/package/baretest), it seeks to deliver an API similar to Jest's with minimal code.

## Compatibility

The Beartest test runner uses dynamic imports, and so is only compatible with Node ^14 (and Node 12 experimentally).

### Usage

_Beartest_ implements the following functions `describe`, `it`, `beforeAll`, `beforeEach`, `afterEach`, `afterAll`, `it.skip`, and `it.only`. This package has a single default export: the `describe` function. All provided functions work in a similar way as the corresponding functions in Jest.

### Example

```javascript
import { describe, it } from 'beartest-js';
import assert from 'assert';

describe('Math Testing', () => {
  it('should add correctly', async () => {
    assert.strictEqual(1 + 2, 3);
  });

  it('should subtract correctly', async () => {
    assert.strictEqual(3 - 2, 1);
  });
});
```

### Running Tests

Additionally, a very basic test runner is included. This test runner accepts a glob pattern as a command line argument. The test runner can be invoked with `node node_modules/beartest-js/testrunner.js "glob-pattern"`.  By default, it will look for `**/*.test.js`.

Suggested package script:

```json
  "scripts": {
    "test": "node node_modules/.bin/beartest"
  }
```

## License

Licensed under [MIT](./LICENSE).
