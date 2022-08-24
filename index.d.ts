type test = (name: string, fn: () => void | Promise<void>) => void;

type Describe = (headline: string, fn: () => void) => Promise<boolean>;
type It = test & { only: test; skip: test };
type BeforeAll = (fn: () => void | Promise<void>) => void;
type AfterAll = (fn: () => void | Promise<void>) => void;
type BeforeEach = (fn: () => void | Promise<void>) => void;
type AfterEach = (fn: () => void | Promise<void>) => void;

export declare const describe: Describe;
export declare const it: It;

export declare const beforeAll: BeforeAll;
export declare const afterAll: AfterAll;
export declare const beforeEach: BeforeEach;
export declare const afterEach: AfterEach;

interface BearTest {
  describe: Describe;
  it: It;
  beforeAll: BeforeAll;
  afterAll: AfterAll;
  beforeEach: BeforeEach;
  afterEach: AfterEach;
}

export default BearTest;
