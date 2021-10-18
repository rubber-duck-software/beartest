const rgb = require('barecolor');

async function RunSerially(fnArray) {
  for (const fn of fnArray) {
    await fn();
  }
}
const suiteStack = [];
const top = () =>
  suiteStack.length ? suiteStack[suiteStack.length - 1] : undefined;

const registerTest = (suite, name, fn) => async () => {
  const prefix = '  '.repeat(suite.depth);
  try {
    await suite.beforeEach();
    await fn();
    rgb.green(prefix + `✓`);
    rgb.gray(` ${name}\n`);
  } catch (e) {
    rgb.red(`\n${prefix}✗ ${name} \n\n`);
    throw e;
  } finally {
    await suite.afterEach();
  }
};

async function runSuite(suite) {
  const prefix = '  '.repeat(suite.depth);
  const tests = suite.only.length > 0 ? suite.only : suite.tests;
  rgb.cyanln(prefix + suite.headline + ' ');
  try {
    await suite.beforeAll();
    await RunSerially(tests);
  } finally {
    await suite.afterAll();
  }
}

async function suite(headline, fn, only = false) {
  const parent = top();
  const self = {
    depth: parent ? parent.depth + 1 : 0,
    headline,
    beforeAllHooks: [],
    async beforeAll() {
      await RunSerially(this.beforeAllHooks);
    },
    beforeEachHooks: [],
    async beforeEach() {
      if (parent) await parent.beforeEach();
      await RunSerially(this.beforeEachHooks);
    },
    afterAllHooks: [],
    async afterAll() {
      await RunSerially(this.afterAllHooks);
    },
    afterEachHooks: [],
    async afterEach() {
      await RunSerially(this.afterEachHooks);
      if (parent) await parent.afterEach();
    },
    tests: [],
    only: [],
  };
  if (parent && only) parent.only.push(() => runSuite(self));
  if (parent && !only) parent.tests.push(() => runSuite(self));
  suiteStack.push(self);
  fn();
  suiteStack.pop();
  if (self.depth === 0) {
    await runSuite(self);
  }
}

const describe = (headline, fn) => suite(headline, fn);
describe.skip = () => {};
describe.only = (headline, fn) => suite(headline, fn, true);
const it = (name, fn) => top().tests.push(registerTest(top(), name, fn));
it.only = (name, fn) => top().only.push(registerTest(top(), name, fn));
it.skip = () => {};
const beforeAll = (fn) => top().beforeAllHooks.push(fn);
const afterAll = (fn) => top().afterAllHooks.push(fn);
const beforeEach = (fn) => top().beforeEachHooks.push(fn);
const afterEach = (fn) => top().afterEachHooks.push(fn);

module.exports = {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
};
