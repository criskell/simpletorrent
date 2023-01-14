import fs from "fs/promises";
import { Downloader, Torrent } from "@criskell/ntorrent";

export const handleDownloadCommand = async (args) => {
  validateArgs(args);

  const download = {
    torrent: await getTorrent(args.values[0]),
  };
  const downloader = new Downloader(download);

  await downloader.start();
};

const getTorrent = async (path) => {
  try {
    return Torrent.fromBuffer(await fs.readFile(path));
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error(`O caminho para o arquivo .torrent não existe: ${path}`);
      process.exit(-1);
    }

    throw e;
  }
};

const validateArgs = (args) => {
  if (args.values.length < 1) {
    showUsageError("É necessário informar o caminho para o arquivo .torrent.");
  }

  if (!args.shortOptions.o) {
    showUsageError("É necessário informar a saída do download.");
  }
};

const showUsageError = (err) => {
  console.error(showUsage(err));
  process.exit(-1);
};

const showUsage = (err = '') => {
  return `
ntorrent-cli
${err ? `\nERRO: ${err}\n` : ''}
Modo de uso:

<caminho-para-torrent> -o .

Onde:
    -o: Saída do download.
`.trim();
};