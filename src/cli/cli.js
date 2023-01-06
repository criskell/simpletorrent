import yargs from "yargs";
import fs from "node:fs/promises";

const runCli = async (args) => {
  const argv = yargs(args)
    .command("$0 <torrentFile>", "Baixa arquivos torrent.", (yargs) => {
      yargs.positional("torrentFile", {
        type: "string",
        describe: "Caminho para o arquivo torrent."
      });
    })
    .help()
    .argv;

  const rawTorrent = await fs.readFile(argv.torrentFile);
  const torrent = parseTorrent(rawTorrent);

  await download(torrent);
};