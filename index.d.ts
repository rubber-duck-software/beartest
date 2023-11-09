type testFn = (name: string, fn: () => unknown) => void;

type BearTest = testFn & {
  skip: testFn;
  only: testFn;
  describe: testFn & { skip: testFn; only: testFn };
  before(fn: () => unknown): void;
  after(fn: () => unknown): void;
  beforeEach(fn: () => unknown): void;
  afterEach(fn: () => unknown): void;
};

export declare const test: BearTest;
export declare const runner: {
  waitForTests: Promise<void>;
};
