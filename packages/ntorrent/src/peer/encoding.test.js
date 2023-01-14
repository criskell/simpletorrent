import { expect } from "chai";

import { encodeMessage } from "./encoding.js";

describe("peer.messages.encoding", () => {
  describe("encodeMessage", () => {
    it("should throw when an object with the type property is not passed", () => {
      expect(() => encodeMessage()).to.throw();
    });

    it("should throw when an object with invalid type is passed", () => {
      expect(() => encodeMessage({ type: "foo" })).to.throw();
    });

    it("should encode keep-alive message", () => {
      expect(encodeMessage({ type: "keep-alive" })).to.eql(Buffer.from([0, 0, 0, 0]));
    });

    it("should encode handshake message", () => {
      const protocolIdentifierLength = Buffer.from([19]);
      const protocolId = Buffer.from("BitTorrent protocol");
      const peerId = Buffer.from("inthisfieldhaspeerid");
      const reservedBytes = Buffer.from("fobarfoo");
      const infohash = Buffer.from("123456789abcdefghijk");

      const handshake = {
        type: "handshake",
        payload: {
          peerId,
          reservedBytes,
          infohash,
        },
      };

      const expectedBuffer = Buffer.concat([
        protocolIdentifierLength,
        protocolId,
        reservedBytes,
        infohash,
        peerId,
      ]);

      expect(encodeMessage(handshake)).to.eql(expectedBuffer);
    });

    it("should encode unchoke message", () => {
      expect(encodeMessage({ type: "unchoke" })).to.eql(Buffer.from([0, 0, 0, 1, 1]));
    });

    it("should encode choke message", () => {
      expect(encodeMessage({ type: "choke" })).to.eql(Buffer.from([0, 0, 0, 1, 0]));
    });

    it("should encode interested message", () => {
      expect(encodeMessage({ type: "interested" })).to.eql(Buffer.from([0, 0, 0, 1, 2]));
    });

    it("should encode not-interested message", () => {
      expect(encodeMessage({ type: "not-interested" })).to.eql(Buffer.from([0, 0, 0, 1, 3]));
    });

    it("should encode have message", () => {
      expect(encodeMessage({
        type: "have",
        payload: {
          pieceIndex: 0x4123,
        },
      })).to.eql(Buffer.from([0, 0, 0, 5, 4, 0, 0, 0x41, 0x23]));
    });

    it("should encode bitfield message", () => {
      expect(encodeMessage({
        type: "bitfield",
        payload: {
          bitfield: Buffer.from([0x10, 0x20]),
        },
      })).to.eql(Buffer.from([0, 0, 0, 3, 5, 0x10, 0x20]));
    });

    it("should encode block-request message", () => {
      expect(encodeMessage({
        type: "block-request",
        payload: {
          pieceIndex: 1,
          offset: 2,
          length: 3,
        },
      })).to.eql(Buffer.from([
        0, 0, 0, 13,
        6,
        0, 0, 0, 1,
        0, 0, 0, 2,
        0, 0, 0, 3,
      ]));
    });

    it("should encode block message", () => {
      expect(encodeMessage({
        type: "block",
        payload: {
          pieceIndex: 1,
          offset: 2,
          data: Buffer.from("\x10\x20"),
        },
      })).to.eql(Buffer.from([
        0, 0, 0, 11,
        7,
        0, 0, 0, 1,
        0, 0, 0, 2,
        0x10, 0x20,
      ]));
    });

    it("should encode cancel message", () => {
      expect(encodeMessage({
        type: "cancel",
        payload: {
          pieceIndex: 1,
          offset: 2,
          length: 3,
        },
      })).to.eql(Buffer.from([
        0, 0, 0, 13,
        8,
        0, 0, 0, 1,
        0, 0, 0, 2,
        0, 0, 0, 3,
      ]));
    });

    it("should encode port message", () => {
      expect(encodeMessage({
        type: "port",
        payload: {
          port: 0x1f1a,
        },
      })).to.eql(Buffer.from([
        0, 0, 0, 3,
        9,
        0x1f, 0x1a,
      ]));
    });
  });
});