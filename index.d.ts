export type TestConfig = {
  name: string
  skip: boolean
  only: boolean
  type: 'suite' | 'test'
  fn: () => unknown
}

export interface TestSuite {
  before: (() => unknown)[]
  beforeEach: (() => unknown)[]
  after: (() => unknown)[]
  afterEach: (() => unknown)[]
  tests: TestConfig[]
  name: string
}

export type TestEvent = TestStart | TestPass | TestFail

export interface TestStart {
  type: 'test:start'
  data: {
    /** The test name. */
    name: string
    /** The nesting level of the test. */
    nesting: number
    type: 'suite' | 'test' | undefined
  }
}

export interface TestPass {
  type: 'test:pass'
  data: {
    details: {
      /** The duration of the test in milliseconds. */
      duration_ms: number
      /** The type of the test, used to denote whether this is a suite. */
      type: 'suite' | 'test' | undefined
    }
    /** The test name. */
    name: string
    /** The nesting level of the test. */
    nesting: number
    /** The ordinal number of the test. */
    testNumber: number
    /** Present if context.skip is called. */
    skip: boolean
  }
}

export interface TestFail {
  type: 'test:fail'
  data: {
    /** Additional execution metadata. */
    details: {
      /** The duration of the test in milliseconds. */
      duration_ms: number
      /** An error wrapping the error thrown by the test. */
      error: Error
      /** The type of the test, used to denote whether this is a suite. */
      type: 'suite' | 'test' | undefined
    }
    /** The test name. */
    name: string
    /** The nesting level of the test. */
    nesting: number
    /** The ordinal number of the test. */
    testNumber: number
    /** Present if context.skip is called. */
    skip: boolean
  }
}

export interface TestFunction {
  (name: string, fn: () => unknown): void
  only(name: string, fn: () => unknown): void
  skip(name: string, fn: () => unknown): void
  describe: DescribeFunction
  before(callback: () => unknown): void
  beforeEach(callback: () => unknown): void
  after(callback: () => unknown): void
  afterEach(callback: () => unknown): void
}

export interface DescribeFunction {
  (name: string, fn: () => unknown): void
  only: (name: string, fn: () => unknown) => void
  skip: (name: string, fn: () => unknown) => void
}

export const test: TestFunction
export const run: (options: { files: AsyncIterable<string> | Iterable<string> }) => AsyncGenerator<TestEvent>
