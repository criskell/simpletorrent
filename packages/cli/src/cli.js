import { parseArgs } from "./args-parser.js";
import { handleDownloadCommand } from "./download-command.js";

export const startCli = async (argv) => {
  const args = parseArgs(argv.slice(2));

  await handleDownloadCommand(args);
};