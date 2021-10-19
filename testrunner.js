#!/usr/bin/env node
import beartest from "./beartest.cjs";
import { bearPic } from "./bearpic.cjs";
import glob from "tiny-glob";

const tests = [];
const describe = beartest.describe;
beartest.describe = (headline, fn) => tests.push(describe(headline, fn));

async function runTests() {
  try {
    const globStr = process.argv[2] || "**/*.test.*";
    process.argv.findIndex((e) => e === "--showBear") > -1 &&
      console.info(bearPic);
    const files = await glob(globStr, { absolute: true });
    for (const file of files) {
      await import(file);
      await Promise.all(tests);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

runTests();
