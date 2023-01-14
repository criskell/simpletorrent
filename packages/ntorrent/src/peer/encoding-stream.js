import { Transform } from "node:stream";

import { encodeMessage } from "./encoding.js";

export class MessageEncodingStream extends Transform {
  constructor() {
    super({ writableObjectMode: true });
  }

  _transform(message, _, cb) {
    this.push(encodeMessage(message));
    cb();
  }
}