import { expect } from "chai";

import { MessageEncodingStream } from "./encoding-stream.js";
import { drainReadableStream } from "../support/stream.js";

describe("peer.messages.encoding", () => {
  describe("MessageEncodingStream", () => {
    it("should encode messages when written", async () => {
      const encodingStream = new MessageEncodingStream();

      encodingStream.write({ type: "keep-alive" });
      encodingStream.write({ type: "unchoke" });
      encodingStream.write({ type: "choke" });
      encodingStream.end();

      const buffer = await drainReadableStream(encodingStream);

      expect(buffer).to.eql(Buffer.from([
        // keep-alive
        0, 0, 0, 0,
        // unchoke
        0, 0, 0, 1,
        1,
        // choke
        0, 0, 0, 1,
        0
      ]));
    });
  });
});