#!/usr/bin/env node
const beartest = require("./beartest");
const glob = require("tiny-glob");

async function runTests() {
  try {
    const globStr = process.argv[2] || "**/*.test.*";
    const files = await glob(globStr, { absolute: true });
    for (const file of files) {
      require(file);
      await beartest.runner.waitForTests();
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

runTests();
