const rgb = require("barecolor");

async function RunSerially(fnArray) {
  for (const fn of fnArray) {
    await fn();
  }
}
const suiteStack = [];
let testRunPromise = Promise.resolve();
const top = () => (suiteStack.length ? suiteStack[suiteStack.length - 1] : null);
const topSafe = () => (suiteStack.length ? suiteStack[suiteStack.length - 1] : makeSuite(""));

const registerTest = (suite, name, fn) => async () => {
  const prefix = "  ".repeat(suite.depth);
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
  const prefix = "  ".repeat(suite.depth);
  const tests = suite.only.length > 0 ? suite.only : suite.tests;
  rgb.cyanln(prefix + suite.headline + " ");
  try {
    await suite.beforeAll();
    await RunSerially(tests);
  } finally {
    await suite.afterAll();
  }
}

function makeSuite(headline, only = false, fn = null) {
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
  if (fn) fn();
  if (fn) suiteStack.pop();
  if (self.depth === 0) {
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 0));
    testRunPromise = timeoutPromise.then(() => runSuite(self));
  }
  return self;
}

const describe = (headline, fn) => makeSuite(headline, false, fn);
describe.skip = () => {};
describe.only = (headline, fn) => makeSuite(headline, true, fn);
const it = (name, fn) => topSafe().tests.push(registerTest(topSafe(), name, fn));
it.only = (name, fn) => topSafe().only.push(registerTest(topSafe(), name, fn));
it.skip = () => {};
const beforeAll = (fn) => topSafe().beforeAllHooks.push(fn);
const afterAll = (fn) => topSafe().afterAllHooks.push(fn);
const beforeEach = (fn) => topSafe().beforeEachHooks.push(fn);
const afterEach = (fn) => topSafe().afterEachHooks.push(fn);

module.exports = {
  test: Object.assign(it, {
    describe,
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
  }),
  runner: { waitForTests: () => testRunPromise },
};
