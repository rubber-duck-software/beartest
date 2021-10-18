type test = (name: string, fn: () => void | Promise<void>) => void;

export declare function describe(
  headline: string,
  fn: () => void
): Promise<boolean>;

export declare const it: test & { only: test; skip: test };
export declare function beforeAll(fn: () => void | Promise<void>): void;
export declare function afterAll(fn: () => void | Promise<void>): void;
export declare function beforeEach(fn: () => void | Promise<void>): void;
export declare function afterEach(fn: () => void | Promise<void>): void;
