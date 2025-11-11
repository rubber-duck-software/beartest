#!/usr/bin/env node
const { run } = require('./beartest')
const fs = require('node:fs')
const path = require('node:path')

async function cli() {
  const globStr = process.argv[2] || '**/*.test.*'

  const files = await Array.fromAsync(fs.promises.glob(globStr))

  for await (let event of run({ files: files.map((f) => path.resolve(f)) })) {
    const prefix = '  '.repeat(event.data.nesting)
    if (event.type === 'test:start' && event.data.type === 'suite') {
      if (path.isAbsolute(event.data.name)) {
        console.log(`\x1b[36m${prefix}${path.parse(event.data.name).name} (${path.relative('./', event.data.name)})\x1b[0m`)
      } else {
        console.log(`\x1b[36m${prefix}${event.data.name}\x1b[0m`)
      }
    } else if (event.type === 'test:pass' && event.data.details.type === 'test' && !event.data.skip) {
      process.stdout.write(`\x1b[32m${prefix}✓\x1b[0m\x1b[90m ${event.data.name}\n\x1b[0m`)
    } else if (event.type === 'test:fail' && event.data.details.type === 'test') {
      process.stdout.write(`\x1b[31m\n${prefix}✗ ${event.data.name} \n\n\x1b[0m`)
    }
  }
}

cli()
