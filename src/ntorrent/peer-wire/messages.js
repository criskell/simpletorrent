const MESSAGES = {
  CHOKE: 0,
  UNCHOKE: 1,
  INTERESTED: 2,
  NOT_INTERESTED: 3,
  HAVE: 4,
  BITFIELD: 5,
  REQUEST: 6,
  PIECE: 7,
  CANCEL: 8,
  PORT: 9,
};

export const serializeHandshake = (infohash, peerId) => {
  const buffer = Buffer.alloc(68);

  const protocolId = "BitTorrent protocol";

  // Comprimento do ID do protocolo
  buffer.writeUInt8(protocolId.length, 0);

  // ID do protocolo
  buffer.write(protocolId, 1);
  
  // Deslocamento para os bytes reservados a partir do comprimento e ID do protocolo
  const reservedBytesOffset = 1 + protocolId.length; 

  // Bytes reservados
  const infohashOffset = buffer.writeBigUInt64BE(0, reservedBytesOffset);

  // Infohash
  infohash.copy(buffer, infohashOffset);

  // Deslocamento do ID do peer a partir dos campos anteriores
  const peerIdOffset = infohashOffset + infohash.length;

  // ID do peer
  peerIdOffset.copy(buffer, peerIdOffset);

  return buffer;
};

export const serializeKeepAlive = () => Buffer.alloc(4);

export const serializeChoke = () => serializeIdentified(MESSAGES.CHOKE);

export const serializeUnchoke = () => serializeIdentified(MESSAGES.UNCHOKE);

export const serializeInterested = () => serializeIdentified(MESSAGES.INTERESTED);

export const serializeNotInterested = () => serializeIdentified(MESSAGES.NOT_INTERESTED);

export const serializeHave = (index) => {
  const payload = Buffer.alloc(4);

  payload.writeUInt32BE(index, 0);

  return serializeIdentified(MESSAGES.HAVE);
};

export const serializeBitfield = (bitfield) => serializeIdentified(MESSAGES.BITFIELD, bitfield);

export const serializeRequestPayload = ({ index, begin, length }) => {
  const payload = Buffer.alloc(12);

  payload.writeUInt32BE(index, 0);
  payload.writeUInt32BE(begin, 4);
  payload.writeUInt32BE(length, 8);

  return payload;
};

export const serializeRequest = (request) =>
  serializeIdentified(MESSAGES.REQUEST, serializeRequestPayload(request));

export const serializePiece = ({ index, begin, block }) => {
  const headers = Buffer.alloc(8);

  headers.writeUInt32BE(index, 0);
  headers.writeUInt32BE(begin, 4);

  return serializeIdentified(MESSAGES.PIECE, Buffer.concat([headers, body]));
};

export const serializeCancel = (request) =>
  serializeIdentified(MESSAGES.CANCEL, serializeRequestPayload);

export const serializePort = (port) => {
  const payload = Buffer.alloc(2);

  payload.writeUInt16BE(port, 0);

  return serializeIdentified(MESSAGES.PORT, payload);
};

const serializeLengthPrefixed = (message) => {
  const length = Buffer.alloc(4);

  length.writeUInt32BE(message.length, 0);

  return Buffer.concat([length, message]);
};

const serializeIdentified = (id, payload) => {
  const idBuffer = Buffer.from(id);

  if (payload) return serializeLengthPrefixed(idBuffer);

  return serializeLengthPrefixed(Buffer.concat([idBuffer, payload]));
};