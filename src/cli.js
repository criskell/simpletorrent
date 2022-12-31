#!/usr/bin/node
import yargs from "yargs";
import fs from "node:fs/promises";
import { hideBin } from "yargs/helpers";

import { parseTorrent } from "./torrent.js";
import { download } from "./client.js";

const main = async (argv) => {
  const rawTorrent = await fs.readFile(argv.torrentFile);
  const torrent = parseTorrent(rawTorrent);

  await download(torrent);
};

const argv = yargs(hideBin(process.argv))
  .command("$0 <torrentFile>", "Baixa arquivos torrent.", (yargs) => {
    yargs.positional("torrentFile", {
      type: "string",
      describe: "Caminho para o arquivo torrent."
    });
  })
  .help()
  .argv;

main(argv);