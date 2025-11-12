#!/usr/bin/env node

const { run } = require('./beartest')
const fs = require('node:fs')
const path = require('node:path')

const INCLUDE = ['**/*.{test,spec}.{js,ts,jsx,tsx}']
const EXCLUDE = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**', '**/coverage/**']

const hasGlob = (s) => /[*?\[\]{}()!]/.test(s)
const norm = (p) => p.split(path.sep).join('/')

async function discoverAll() {
  const seen = new Set()
  for (const pat of INCLUDE) {
    for await (const f of fs.promises.glob(pat, { ignore: EXCLUDE })) seen.add(norm(f))
  }
  return [...seen].sort()
}

async function applyFilters(files, args) {
  if (!args.length) return files

  let out = files
  for (const arg of args) {
    if (hasGlob(arg)) {
      const gset = new Set()
      for await (const f of fs.promises.glob(arg, { ignore: EXCLUDE })) gset.add(norm(f))
      out = out.filter((f) => gset.has(f)) // glob filter
    } else {
      const needle = norm(arg)
      out = out.filter((f) => f.includes(needle)) // substring filter
    }
  }
  return out
}

async function cli() {
  const discovered = await discoverAll()
  console.log(discovered)
  const selected = await applyFilters(discovered, process.argv.slice(2))
  console.log(selected)

  for await (let event of run({ files: selected.map((f) => path.resolve(f)) })) {
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
