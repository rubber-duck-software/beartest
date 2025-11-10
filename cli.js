#!/usr/bin/env node
const { run } = require('./beartest')
const fs = require('node:fs')

async function cli() {
  const globStr = process.argv[2] || '**/*.test.*'

  const files = await Array.fromAsync(fs.promises.glob(globStr))

  for await (let event of run({ files: files })) {
    const prefix = '  '.repeat(event.data.nesting)
    if (event.type === 'test:start' && event.data.type === 'suite') {
      process.stdout.write(`\x1b[36m${prefix}${event.data.name} \n\x1b[0m`)
    } else if (event.type === 'test:pass' && event.data.details.type === 'test' && !event.data.skip) {
      process.stdout.write(`\x1b[32m${prefix}✓\x1b[0m\x1b[90m ${event.data.name}\n\x1b[0m`)
    } else if (event.type === 'test:fail' && event.data.details.type === 'test') {
      process.stdout.write(`\x1b[31m\n${prefix}✗ ${event.data.name} \n\n\x1b[0m`)
    }
  }
}

cli()
