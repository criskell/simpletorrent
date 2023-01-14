import { identifiedMessageTypes } from "./messages.js";

export const encodeMessage = ({ type, payload }) => {
  if (type === "keep-alive") return encodeKeepAliveMessage();
  if (type === "handshake") return encodeHandshakeMessage(payload);

  const messageId = identifiedMessageTypes.indexOf(type);

  if (messageId === -1) {
    throw new TypeError(`Invalid type: ${type}`);
  }

  const encodePayload = {
    have: encodeHavePayload,
    bitfield: encodeBitfieldPayload,
    "block-request": encodeBlockRequestPayload,
    cancel: encodeCancelPayload,
    block: encodeBlockPayload,
    port: encodePortPayload,
  }[type];

  if (encodePayload && !payload) {
    throw new TypeError(`Payload required for type ${type}`);
  }

  if (payload) return encodeIdentified(messageId, encodePayload(payload));

  return encodeIdentified(messageId);
};

const encodeHandshakeMessage = ({
  infohash,
  peerId,
  reservedBytes = Buffer.alloc(8),
}) => {
  const buffer = Buffer.alloc(68);

  // Protocol identifier
  const protocolId = "BitTorrent protocol";

  buffer.writeUInt8(protocolId.length, 0);
  buffer.write(protocolId, 1);
  
  // Reserved bytes
  reservedBytes.copy(buffer, 20);

  // Infohash
  infohash.copy(buffer, 28);

  // ID do peer
  peerId.copy(buffer, 48);

  return buffer;
};

const encodeLengthPrefixed = (message) => {
  const length = Buffer.alloc(4);

  length.writeUInt32BE(message.length, 0);

  return Buffer.concat([length, message]);
};

const encodeIdentified = (id, payload) => {
  const idBuffer = Buffer.from([id]);

  if (! payload) return encodeLengthPrefixed(idBuffer);

  return encodeLengthPrefixed(Buffer.concat([idBuffer, payload]));
};

const encodeKeepAliveMessage = () => Buffer.alloc(4);

const encodeHavePayload = ({ pieceIndex }) => {
  const payload = Buffer.alloc(4);

  payload.writeUInt32BE(pieceIndex, 0);

  return payload;
};

const encodeBlockRequestPayload = ({ pieceIndex, offset, length }) => {
  const payload = Buffer.alloc(12);

  payload.writeUInt32BE(pieceIndex, 0);
  payload.writeUInt32BE(offset, 4);
  payload.writeUInt32BE(length, 8);

  return payload;
};

const encodeBlockPayload = ({ pieceIndex, offset, data }) => {
  const headers = Buffer.alloc(8);

  headers.writeUInt32BE(pieceIndex, 0);
  headers.writeUInt32BE(offset, 4);

  return Buffer.concat([headers, data]);
};

const encodeCancelPayload = encodeBlockRequestPayload;

const encodePortPayload = ({ port }) => {
  const payload = Buffer.alloc(2);

  payload.writeUInt16BE(port, 0);

  return payload;
};

const encodeBitfieldPayload = ({ bitfield }) => {
  return bitfield;
};