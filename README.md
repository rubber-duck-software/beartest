<img src="https://beartest-js.s3.amazonaws.com/beartest-logo.png" width="400">

_Beartest_ is an extremely simple JavaScript test runner inspired by Baretest and Jest. It has a tiny footprint while maintaining a familiar API.

### Install

```
npm install --save-dev beartest-js
```

```
yarn add beartest-js -D
```

### Why Beartest?

Jest, Mocha, and similar testing frameworks are richly featured, broadly compatible, and highly customizable. Beartest is none of those things. **If you want features look somewhere else.** Beartest is meant to be simple and understandable, without the complexity of other testing frameworks. Inspired by [Baretest](https://www.npmjs.com/package/baretest), it seeks to deliver an API similar to Jest's with minimal code.

### Compatibility

The Beartest test runner uses common js to load files.

### Usage

_Beartest_ implements the following functions `describe`, `it`, `beforeAll`, `beforeEach`, `afterEach`, `afterAll`, `it.skip`, and `it.only`. All provided functions work in a similar way as the corresponding functions in Jest.

### Example

```javascript
import { describe, it } from "beartest-js";
import assert from "assert";

describe("Math Testing", () => {
  it("should add correctly", async () => {
    assert.strictEqual(1 + 2, 3);
  });

  it("should subtract correctly", async () => {
    assert.strictEqual(3 - 2, 1);
  });
});
```

### Running Tests

Additionally, a very basic test runner is included. This test runner accepts a glob pattern as a command line argument. The test runner can be invoked with `yarn beartest "glob-pattern"`. By default, it will look for `**/*.test.js`.

Suggested package script:

```json
  "scripts": {
    "test": "beartest"
  }
```

## License

Licensed under [MIT](./LICENSE).
