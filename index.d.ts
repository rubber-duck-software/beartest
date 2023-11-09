type testFn = (name: string, fn: () => unknown) => void;

type test = testFn & {
  skip: testFn;
  only: testFn;
  describe: testFn & { skip: testFn; only: testFn };
  beforeAll(fn: () => unknown): void;
  afterAll(fn: () => unknown): void;
  beforeEach(fn: () => unknown): void;
  afterEach(fn: () => unknown): void;
};

type Describe = (headline: string, fn: () => void) => Promise<boolean>;
type It = test & { only: test; skip: test };
type BeforeAll = (fn: () => void | Promise<void>) => void;
type AfterAll = (fn: () => void | Promise<void>) => void;
type BeforeEach = (fn: () => void | Promise<void>) => void;
type AfterEach = (fn: () => void | Promise<void>) => void;

export declare const test: test;
export declare const runner: {
  waitForTests: Promise<void>;
};
