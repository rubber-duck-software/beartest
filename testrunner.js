#!/usr/bin/env node
const beartest = require("./beartest");
const glob = require("tiny-glob");
const rgb = require("barecolor");
const path = require("path");

async function runTests() {
  try {
    const globStr = process.argv[2] || "**/*.test.*";
    const files = await glob(globStr, { absolute: true });
    for (const file of files) {
      rgb.blue(`${path.parse(file).name} (${path.relative("./", file)})\n`);
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
