#!/usr/bin/env node

import { run } from './beartest.js'
import { formatEvent } from './reporter.js'
import { promises } from 'node:fs'
import { sep, resolve } from 'node:path'

const INCLUDE = ['**/*.{test,spec}.{js,ts,jsx,tsx}']
const EXCLUDE = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**', '**/coverage/**']

const hasGlob = (s) => /[*?\[\]{}()!]/.test(s)
const norm = (p) => p.split(sep).join('/')

async function discoverAll() {
  const seen = new Set()
  for (const pat of INCLUDE) {
    for await (const f of promises.glob(pat, { ignore: EXCLUDE })) seen.add(norm(f))
  }
  return [...seen].sort()
}

async function applyFilters(files, args) {
  if (!args.length) return files

  let out = files
  for (const arg of args) {
    if (hasGlob(arg)) {
      const gset = new Set()
      for await (const f of promises.glob(arg, { ignore: EXCLUDE })) gset.add(norm(f))
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
  const selected = await applyFilters(discovered, process.argv.slice(2))

  let failed = false
  try {
    for await (const event of run({ files: selected.map((f) => resolve(f)) })) {
      if (event.type === 'test:fail') failed = true
      const line = formatEvent(event)
      if (line !== undefined) console.log(line)
    }
  } catch {
    failed = true // the run aborts at the first failure, which formatEvent has already reported
  }

  process.exit(failed ? 1 : 0)
}

cli()
