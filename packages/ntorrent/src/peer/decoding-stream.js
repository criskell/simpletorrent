import { Transform } from "node:stream";

import { DecodeError } from "./errors.js";
import { decodeHandshakeMessage, decodeLengthPrefixedMessage } from "./decoding.js";

export const MAX_MESSAGE_LENGTH = (
  2 ** 17 // Block data (max. 2**17 bytes)
  + 8 // Block message headers (8 bytes)
  + 1 // Block message identifier (1 byte)
  + 4 // Length (4 bytes)
);

const HANDSHAKE_START_BYTE = 19;

export class MessageDecodingStream extends Transform {
  constructor({ maxMessageLength = MAX_MESSAGE_LENGTH } = {}) {
    super({ readableObjectMode: true });
    this._maxMessageLength = maxMessageLength;
    this._buffer = Buffer.alloc(0);
  }

  _transform(chunk, _, cb) {
    if (this._buffer.length + chunk.length > this._maxMessageLength) {
      return cb(new DecodeError(`Maximum message length reached.`));
    }

    this._buffer = Buffer.concat([this._buffer, chunk]);

    if (this._buffer[0] === HANDSHAKE_START_BYTE
        && this._buffer.length >= 68) {
      const handshake = this._buffer.subarray(0, 68);

      this._buffer = this._buffer.subarray(68);

      this.push(decodeHandshakeMessage(handshake));
    }

    if (this._buffer[0] !== HANDSHAKE_START_BYTE && this._buffer.length >= 4) {
      const length = this._buffer.readUInt32BE(0) + 4;

      if (length > this._maxMessageLength) {
        return cb(new DecodeError(`Length indicated in the length-prefixed message is outside the maximum limit.`));
      }

      if (this._buffer.length >= length) {
        const lengthPrefixedMessage = this._buffer.subarray(0, length);

        this._buffer = this._buffer.subarray(length);

        this.push(decodeLengthPrefixedMessage(lengthPrefixedMessage));
      }
    }

    cb();
  }
}