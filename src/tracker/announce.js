import { announce as udpAnnounce } from "./udp.js";
import { randomBytes } from "../crypto.js";

const protocols = {
  "udp:": udpAnnounce,
};

export const announce = async (options) => {
  options.key ||= await randomBytes(4);
  options.peerCount ||= -1;
  options.stats ||= {};
  options.stats.downloaded ||= 0xffffffffn;
  options.stats.left ||= 0n;
  options.stats.uploaded ||= 0n;
  options.port = 6881;

  const announcer = protocols[options.url.protocol];

  if (!announcer) {
    throw new Error("Protocolo não suportado: " + options.url.protocol);
  }

  return announcer(options);
};