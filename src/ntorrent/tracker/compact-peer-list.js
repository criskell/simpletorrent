export const parseCompactPeerList = (list) => {
  const peers = [];

  let cursor = 0;

  while (cursor + 6 < list.length) {
    const ip = list.slice(cursor, cursor + 4).join(".");
    const port = list.readUInt16BE(cursor + 4);

    cursor += 6;

    peers.push([{
      address: ip,
      port,
    }]);
  }

  return peers;
};