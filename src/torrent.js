import crypto from "node:crypto";
import bencode from "bencode";

export const parseTorrent = (raw) => {
  const torrent = bencode.decode(raw);

  torrent.infohash = crypto.createHash("sha1")
    .update(bencode.encode(torrent.info))
    .digest();

  torrent.announceUrls = [
    new URL(torrent.announce.toString("utf8")),
  ];

  return torrent;
};