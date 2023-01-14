import { expect } from "chai";

import { encode } from "./encode.js";

describe("bencode.bencode", () => {
  it("should encode a buffer", () => {
    expect(encode(Buffer.from("foo"))).to.eql(Buffer.from("3:foo"));
  });

  it("should encode a string", () => {
    expect(encode("foo")).to.eql(Buffer.from("3:foo"));
  });

  it("should encode a list", () => {
    expect(encode(["foo", "barz"])).to.eql(Buffer.from("l3:foo4:barze"));
  });

  it("should encode an integer", () => {
    expect(encode(10)).to.eql(Buffer.from("i10e"));
  });

  it("should encode a map", () => {
    expect(encode(new Map([
      ["k1", "v1"],
      ["k2", "v2"],
    ]))).to.eql(Buffer.from("d2:k12:v12:k22:v2e"));
  });

  it("should encode a object", () => {
    expect(encode({
      "k1": "v1",
      "k2": "v2",
    })).to.eql(Buffer.from("d2:k12:v12:k22:v2e"));
  });

  it("should sort keys in dictionary encoding", () => {
    expect(encode({
      "k2": "v2",
      "k1": "v1",
    })).to.eql(Buffer.from("d2:k12:v12:k22:v2e"));
  });
});