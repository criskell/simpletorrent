#!/usr/bin/node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .command("$0 <file>", "Baixa arquivos torrent.", (yargs) => {
    yargs.positional("file", {
      type: "string",
      describe: "Caminho para o arquivo torrent."
    });
  })
  .help()
  .argv;

console.log(argv);