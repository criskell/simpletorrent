import bencode from "../bencode/encoding.js";

class Torrent {
  constructor(metainfo) {
    this._metainfo = metainfo;

    this.infohash = crypto.createHash("sha1")
      .update(bencode.encode(metainfo.info))
      .digest();

    const rawAnnounceUrls = Array.isArray(metainfo.announce)
      ? torrent.announce
      : [torrent.announce];

    this.announceUrls = rawAnnounceUrls.map((announce) => new URL(announce.toString("utf8")));

    this.size = metainfo.info.files
      ? metainfo.info.files.map((file) => BigInt(file.length)).reduce((a, b) => a + b)
      : BigInt(metainfo.info.length);
  }
}