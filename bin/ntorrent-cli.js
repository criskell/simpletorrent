#!/usr/bin/node
import { runCli } from "../src/cli/cli.js";

await runCli(process.argv.slice(2));