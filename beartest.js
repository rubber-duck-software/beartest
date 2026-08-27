import { formatEvent } from './reporter.js'
export { formatEvent }

async function RunSerially(fnArray) {
  for (const fn of fnArray) await fn()
}

async function* runTestSuite(options = {}) {
  const suite = top()
  const tests = (suite.tests.some((t) => t.only) ? suite.tests.filter((t) => t.only) : suite.tests).filter(
    (t) => !options.only?.length || options.only[0] === t.name
  )
  try {
    await RunSerially(suite.before)
    for (let index = 0; index < tests.length; index++) {
      const test = tests[index]
      let startTime

      const testDetails = { name: test.name, nesting: suiteStack.length, testNumber: index, skip: test.skip }
      const startEvent = { type: 'test:start', data: { name: test.name, nesting: suiteStack.length, type: test.type } }
      const pass = (duration) => ({
        type: 'test:pass',
        data: { details: { duration_ms: duration, type: test.type }, ...testDetails }
      })
      if (test.skip) {
        yield startEvent
        yield pass(0)
      } else {
        try {
          await RunSerially(suite.beforeEach)
          yield startEvent
          startTime = Date.now()

          if (test.type === 'suite') {
            suiteStack.push({ before: [], beforeEach: [], after: [], afterEach: [], tests: [], name: test.name })
            try {
              await test.fn()
              for await (const event of runTestSuite({ only: options.only ? options.only.slice(1) : undefined })) {
                yield event
              }
            } finally {
              suiteStack.pop()
            }
          } else {
            await test.fn()
          }
          yield pass(Date.now() - startTime)
        } catch (e) {
          const error = new Error('[TEST FAILURE]', { cause: e })
          yield {
            type: 'test:fail',
            data: {
              details: { duration_ms: startTime ? Date.now() - startTime : NaN, type: test.type, error },
              ...testDetails
            }
          }
          throw e
        } finally {
          await RunSerially(suite.afterEach)
        }
      }
    }
  } finally {
    await RunSerially(suite.after)
  }
}

// Under loaders like `--import tsx` this module can be evaluated more than once
// (separate module registries). Every copy must share one registry, or tests
// register into one copy while the runner drains another.
const BEARTEST_GLOBAL_STATE = Symbol.for('beartest-js.globalState')
const globalState = (globalThis[BEARTEST_GLOBAL_STATE] ??= {
  suiteStack: [],
  externalRunnerActive: false,
  autoRunArmed: false
})
const suiteStack = globalState.suiteStack

function top() {
  if (!suiteStack.length) {
    suiteStack.push({ before: [], beforeEach: [], after: [], afterEach: [], tests: [], name: '' })
  }
  return suiteStack[suiteStack.length - 1]
}

const describe = (name, fn) => top().tests.push({ name: name, type: 'suite', fn, skip: false, only: false })
describe.skip = (name, fn) => top().tests.push({ name: name, type: 'suite', fn, skip: true, only: false })
describe.only = (name, fn) => top().tests.push({ name: name, type: 'suite', fn, skip: false, only: true })
const it = (name, fn) => top().tests.push({ name: name, type: 'test', fn, skip: false, only: false })
it.only = (name, fn) => top().tests.push({ name: name, type: 'test', fn, skip: false, only: true })
it.skip = (name, fn) => top().tests.push({ name: name, type: 'test', fn, skip: true, only: false })
const before = (fn) => top().before.push(fn)
const beforeEach = (fn) => top().beforeEach.push(fn)
const after = (fn) => top().after.push(fn)
const afterEach = (fn) => top().afterEach.push(fn)

// Flags the runner at call time, not first iteration, so the auto-run hook
// stands down before any file suite is pushed.
export function run(options = {}) {
  globalState.externalRunnerActive = true
  return runFiles(options)
}

async function* runFiles(options = {}) {
  let index = 0
  for await (const file of options.files) {
    const name = file
    const suiteDetails = { name: name, nesting: 0, testNumber: index, skip: false }
    suiteStack.push({ before: [], beforeEach: [], after: [], afterEach: [], tests: [], name })
    let suiteStart
    try {
      await import(file)
      yield { type: 'test:start', data: { name: name, nesting: 0, type: 'suite' } }
      suiteStart = Date.now()
      for await (let event of runTestSuite({ only: options.only })) {
        yield event
      }
      yield {
        type: 'test:pass',
        data: { details: { duration_ms: Date.now() - suiteStart, type: 'suite' }, ...suiteDetails }
      }
    } catch (e) {
      yield {
        type: 'test:fail',
        data: {
          details: { duration_ms: suiteStart ? Date.now() - suiteStart : NaN, type: 'suite', error: e },
          ...suiteDetails
        }
      }
      throw e
    } finally {
      suiteStack.pop()
      index++
    }
  }
}

export const test = Object.assign(it, { describe, before, beforeEach, after, afterEach })

// Runs the tests a file registered when executed directly (`node some.test.js`).
// Armed once across duplicate module copies, and stands down whenever run()
// is driving, so an external run is never drained in parallel or exited early.
if (!globalState.autoRunArmed) {
  globalState.autoRunArmed = true
  setTimeout(async () => {
    if (globalState.externalRunnerActive || !suiteStack.length) return
    let failed = false
    try {
      for await (const event of runTestSuite()) {
        const line = formatEvent(event)
        if (line !== undefined) console.log(line)
      }
    } catch {
      failed = true // the run aborts at the first failure, which formatEvent has already reported
    }
    process.exit(failed ? 1 : 0)
  }, 0)
}
