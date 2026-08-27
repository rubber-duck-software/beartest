import { isAbsolute, parse, relative } from 'node:path'

const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const GREY = '\x1b[90m'
const RESET = '\x1b[0m'

// Returns the console output for one event, or undefined when the event is not reported.
export function formatEvent(event) {
  const prefix = '  '.repeat(event.data.nesting)

  if (event.type === 'test:start' && event.data.type === 'suite') {
    return `${CYAN}${prefix}${formatSuiteName(event.data.name)}${RESET}`
  }
  if (event.type === 'test:pass' && event.data.details.type === 'test' && !event.data.skip) {
    return `${GREEN}${prefix}✓${RESET}${GREY} ${event.data.name}${RESET}`
  }
  if (event.type === 'test:fail' && event.data.details.type === 'test') {
    return `${RED}${prefix}✗ ${event.data.name}${RESET}${formatError(event.data.details.error, prefix)}`
  }
  return undefined
}

function formatSuiteName(name) {
  if (!isAbsolute(name)) return name
  return `${parse(name).name} (${relative('./', name)})`
}

// Test failures arrive wrapped in Error('[TEST FAILURE]', { cause }); the cause is what the test author threw.
function formatError(error, prefix) {
  if (!error) return ''
  const thrown = error.cause ?? error
  const message = thrown.message || String(thrown)
  const stack = thrown.stack ? stripMessageHeader(thrown.stack, message) : []
  return '\n' + [message, ...stack].map((line) => `\n${prefix}  ${line}`).join('')
}

function stripMessageHeader(stack, message) {
  const lines = stack.split('\n')
  return lines[0].includes(message) ? lines.slice(1) : lines
}
