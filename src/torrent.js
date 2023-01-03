import crypto from "node:crypto";
import bencode from "./bencode/encoding.js";

export const makeTorrentFrom = (raw) => {
  const torrent = {};

  const decodedTorrent = bencode.decode(raw);

  torrent.infohash = crypto.createHash("sha1")
    .update(bencode.encode(torrent.info))
    .digest();

  const announces = Array.isArray(torrent.announce)
    ? torrent.announce
    : [torrent.announce];

  torrent.announceUrls = announces.map((announce) => new URL(announce.toString("utf8")));

  torrent.size = torrent.info.files
    ? torrent.info.files.map((file) => BigInt(file.length)).reduce((a, b) => a + b)
    : BigInt(torrent.info.length);

  return torrent;
};