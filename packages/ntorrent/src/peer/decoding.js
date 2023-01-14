import { DecodeError } from "./errors.js";
import { identifiedMessageTypes } from "./messages.js";

export const decodeLengthPrefixedMessage = (message) => {
  if (message.length < 4) {
    throw new DecodeError("The length-prefixed message must be at least 4 bytes long.");
  }

  const length = message.readUInt32BE(0);

  if (length === 0) return { type: "keep-alive" };

  if (message.length < 5) {
    throw new DecodeError("The length-prefixed message has missing identifier.");
  }

  const type = identifiedMessageTypes[message.readUInt8(4)];

  if (type === undefined) {
    throw new DecodeError("The identifier of length-prefixed message sent is invalid.");
  }

  const decodePayload = {
    have: decodeHavePayload,
    "block-request": decodeBlockRequestPayload,
    cancel: decodeCancelPayload,
    block: decodeBlockPayload,
    port: decodePortPayload,
  }[type];

  if (decodePayload) return {
    type,
    payload: decodePayload(message.subarray(5)),
  };

  return { type };
};

export const decodeHandshakeMessage = (buffer) => {
  if (buffer.length !== 68) {
    throw new DecodeError("The handshake message length must be 68.");
  }

  if (buffer[0] !== 19) {
    throw new DecodeError("The protocol identifier length field of the message must be 19.");
  }

  const protocolId = buffer.toString("utf8", 1, 20);

  if (protocolId !== "BitTorrent protocol") {
    throw new DecodeError("The handshake does not have a valid protocol identifier.");
  }

  return {
    type: "handshake",
    payload: {
      protocolId,
      reservedBytes: buffer.subarray(20, 28),
      infohash: buffer.subarray(28, 48),
      peerId: buffer.subarray(48, 68),
    },
  };
};

export const decodeHavePayload = (buffer) => {
  if (buffer.length !== 4) {
    throw new DecodeError("The have message payload length must be 4.");
  }

  return {
    index: buffer.readUInt32BE(0),
  };
};

export const decodeBlockRequestPayload = (buffer) => {
  if (buffer.length !== 12) {
    throw new DecodeError("The request message payload length must be 12.");
  }

  return {
    pieceIndex: buffer.readUInt32BE(0),
    offset: buffer.readUInt32BE(4),
    length: buffer.readUInt32BE(8),
  };
};

export const decodeCancelPayload = decodeBlockRequestPayload;

export const decodeBlockPayload = (buffer) => {
  if (buffer.length < 8) {
    throw new DecodeError("The block message payload must be at least 8 bytes long.");
  }

  return {
    pieceIndex: buffer.readUInt32BE(0),
    offset: buffer.readUInt32BE(4),
    data: buffer.subarray(8),
  };
};

export const decodePortPayload = (buffer) => {
  if (buffer.length !== 2) {
    throw new DecodeError("The port message payload length must be 2.");
  }

  return {
    port: buffer.readUInt16BE(0),
  };
};