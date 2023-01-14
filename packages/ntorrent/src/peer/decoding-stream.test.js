import { expect } from "chai";

import { MessageDecodingStream } from "./decoding-stream.js";
import { DecodeError } from "./errors.js";
import { writeChunkedBuffer, drainReadableStream } from "../support/stream.js";

describe("peer.messages.decoding", () => {
  describe("MessageDecodingStream", () => {
    it("should decode a handshake message streamed", async () => {
      const decodingStream = new MessageDecodingStream();

      const protocolIdentifierLength = Buffer.from([19]);
      const protocolId = Buffer.from("BitTorrent protocol");
      const peerId = Buffer.from("inthisfieldhaspeerid");
      const reservedBytes = Buffer.from("fobarfoo");
      const infohash = Buffer.from("123456789abcdefghijk");

      const handshakeBuffer = Buffer.concat([
        protocolIdentifierLength,
        protocolId,
        reservedBytes,
        infohash,
        peerId,
      ]);

      writeChunkedBuffer(decodingStream, handshakeBuffer, 5);
      decodingStream.end();

      const fetchedMessages = await drainReadableStream(decodingStream);

      expect(fetchedMessages[0]).to.eql({
        type: "handshake",
        payload: {
          protocolId: "BitTorrent protocol",
          reservedBytes,
          infohash,
          peerId,
        },
      });
    });

    it("should throw if it sends a chunk of data that exceeds the maximum message length", (done) => {
      const decodingStream = new MessageDecodingStream({
        maxMessageLength: 8,
      });

      decodingStream.write(Buffer.from([0, 0, 0, 4]));
      decodingStream.write(Buffer.from("123456789abcdefghijk"));
      decodingStream.end();

      decodingStream.on("error", (err) => {
        expect(err).to.be.instanceof(DecodeError);
        done();
      });
    });

    it("should throw when sending a length-prefixed message with a maximum length", (done) => {
      const decodingStream = new MessageDecodingStream({
        maxMessageLength: 8,
      });

      decodingStream.write(Buffer.from([0, 0, 0, 9]));
      decodingStream.end();

      decodingStream.on("error", (err) => {
        expect(err).to.be.instanceof(DecodeError);
        done();
      });
    });

    it("should decode streamed messages", async () => {
      const decodingStream = new MessageDecodingStream();

      const messages = [
        {
          expected: {
            type: "handshake",
            payload: {
              protocolId: "BitTorrent protocol",
              peerId: Buffer.from("********************"),
              reservedBytes: Buffer.from("12345678"),
              infohash: Buffer.from("____________________"),
            },
          },
          encoded: Buffer.from("\x13BitTorrent protocol12345678____________________********************"),
        },
        {
          expected: { type: "unchoke" },
          encoded: Buffer.from([0, 0, 0, 1, 1]),
        },
        {
          expected: { type: "interested" },
          encoded: Buffer.from([0, 0, 0, 1, 2]),
        },
        {
          expected: { 
            type: "block-request",
            payload: {
              pieceIndex: 1,
              offset: 2,
              length: 3,
            },
          },
          encoded: Buffer.from([
            0, 0, 0, 13,
            6,
            0, 0, 0, 1,
            0, 0, 0, 2,
            0, 0, 0, 3,
          ]),
        },
      ];

      let i = 0;

      for (const message of messages) {
        writeChunkedBuffer(
          decodingStream,
          message.encoded,
          [1, 5, 8][++i % 3],
        );
      }

      decodingStream.end();

      const fetchedMessages = await drainReadableStream(decodingStream);

      expect(fetchedMessages).to.eql(messages.map(({ expected }) => expected));
    });
  });
});