import { randomBytes } from "./crypto.js";
import { announce } from "./tracker/announce.js";
import { EVENTS } from "./tracker/enums.js";

export const download = async (torrent) => {
  const peerId = await generatePeerId();

  // const announceResponse = await announce({
  //   url: torrent.announceUrls[0],
  //   peerId,
  //   infohash: torrent.infohash,
  //   event: EVENTS.START,
  //   stats: {
  //     left: torrent.size,
  //   },
  // });

  console.log(torrent.size);
};

export const generatePeerId = async () => {
  return Buffer.concat([
    Buffer.from("-CT0001-"),
    await randomBytes(12),
  ]);
};