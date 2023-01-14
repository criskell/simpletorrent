import { expect } from "chai";

import { DecodeError } from "./errors.js";

import {
  decodeHandshakeMessage,
  decodeHavePayload,
  decodeBlockRequestPayload,
  decodeBlockPayload,
  decodeCancelPayload,
  decodePortPayload,
} from "./decoding.js";

describe("peer.messages.decoding", () => {
  describe("decodeHandshakeMessage", () => {
    it("should throw error with buffer having length other than 68", () => {
      const buffer = Buffer.alloc(69);

      expect(() => decodeHandshakeMessage(buffer)).to.throw(DecodeError, "68");
    });

    it("should throw error with buffer having invalid protocol identifier length", () => {
      const buffer = Buffer.alloc(68);

      expect(() => decodeHandshakeMessage(buffer)).to.throw(DecodeError, "identifier length");
    });

    it("should throw error with buffer having no protocol identifier", () => {
      const buffer = Buffer.alloc(68);

      expect(() => decodeHandshakeMessage(buffer)).to.throw(DecodeError, "identifier");
    });

    it("should return the fields of a valid handshake message", () => {
      const protocolIdentifierLength = Buffer.from([19]);
      const protocolId = Buffer.from("BitTorrent protocol");
      const peerId = Buffer.from("inthisfieldhaspeerid");
      const reservedBytes = Buffer.from("fobarfoo");
      const infohash = Buffer.from("123456789abcdefghijk");

      const buffer = Buffer.concat([
        protocolIdentifierLength,
        protocolId,
        reservedBytes,
        infohash,
        peerId,
      ]);

      expect(decodeHandshakeMessage(buffer)).to.eql({
        type: "handshake",
        payload: {
          protocolId: "BitTorrent protocol",
          reservedBytes,
          infohash,
          peerId,
        },
      });
    });
  });

  describe("decodeHavePayload", () => {
    it("should throw an error if passed a buffer with a length other than 4 bytes", () => {
      expect(() => decodeHavePayload(Buffer.alloc(3))).to.throw(DecodeError);
      expect(() => decodeHavePayload(Buffer.alloc(5))).to.throw(DecodeError);
    });

    it("should return an index on valid payloads", () => {
      const payload = Buffer.from([0x00, 0x00, 0x00, 0x4]);

      expect(decodeHavePayload(payload)).to.eql({
        index: 4,
      });
    });
  });

  describe("decodeBlockRequestPayload", () => {
    it("should throw an error if passed a buffer with a length other than 12 bytes", () => {
      expect(() => decodeBlockRequestPayload(Buffer.alloc(11))).to.throw(DecodeError);
      expect(() => decodeBlockRequestPayload(Buffer.alloc(13))).to.throw(DecodeError);
    });

    it("should return correct fields on valid payloads", () => {
      const payload = Buffer.alloc(12);

      payload.writeUInt32BE(5, 0); // piece index
      payload.writeUInt32BE(587, 4); // offset
      payload.writeUInt32BE(1025, 8); // length

      expect(decodeBlockRequestPayload(payload)).to.eql({
        pieceIndex: 5,
        offset: 587,
        length: 1025,
      });
    });
  });

  describe("decodeBlockPayload", () => {
    it("should throw an error if passed a buffer with length less than 8 bytes", () => {
      expect(() => decodeBlockPayload(Buffer.alloc(7))).to.throw(DecodeError);
    });

    it("should return correct fields on valid payloads", () => {
      const payload = Buffer.alloc(10);
      
      const pieceIndex = 10;
      const offset = 578;
      const data = Buffer.from("hi");

      payload.writeUInt32BE(pieceIndex, 0); // piece index
      payload.writeUInt32BE(offset, 4); // offset
      data.copy(payload, 8);

      expect(decodeBlockPayload(payload)).to.eql({
        pieceIndex,
        offset,
        data,
      });
    });
  });

  describe("decodeCancelPayload", () => {
    it("should throw an error if passed a buffer with a length other than 12 bytes", () => {
      expect(() => decodeCancelPayload(Buffer.alloc(11))).to.throw(DecodeError);
      expect(() => decodeCancelPayload(Buffer.alloc(13))).to.throw(DecodeError);
    });

    it("should return correct fields on valid payloads", () => {
      const payload = Buffer.alloc(12);

      payload.writeUInt32BE(5, 0); // piece index
      payload.writeUInt32BE(587, 4); // offset
      payload.writeUInt32BE(1025, 8); // length

      expect(decodeCancelPayload(payload)).to.eql({
        pieceIndex: 5,
        offset: 587,
        length: 1025,
      });
    });
  });

  describe("decodePortPayload", () => {
    it("should throw an error if passed a buffer with a length other than 2 bytes", () => {
      expect(() => decodePortPayload(Buffer.alloc(1))).to.throw(DecodeError);
      expect(() => decodePortPayload(Buffer.alloc(3))).to.throw(DecodeError);
    });

    it("should return an port on valid payloads", () => {
      const payload = Buffer.from([0x40, 0x80]);

      expect(decodePortPayload(payload)).to.eql({
        port: 0x4080,
      });
    });
  });
});