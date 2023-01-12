import { expect } from "chai";

import { encode } from "./encode.js";

describe("bencode/bencode", () => {
  it("deve codificar um buffer", () => {
    expect(encode(Buffer.from("foo"))).to.eql(Buffer.from("3:foo"));
  });

  it("deve codificar uma string", () => {
    expect(encode("foo")).to.eql(Buffer.from("3:foo"));
  });

  it("deve codificar uma lista", () => {
    expect(encode(["foo", "barz"])).to.eql(Buffer.from("l3:foo4:barze"));
  });

  it("deve codificar um inteiro", () => {
    expect(encode(10)).to.eql(Buffer.from("i10e"));
  });

  it("deve codificar um map", () => {
    expect(encode(new Map([
      ["k1", "v1"],
      ["k2", "v2"],
    ]))).to.eql(Buffer.from("d2:k12:v12:k22:v2e"));
  });

  it("deve codificar um objeto", () => {
    expect(encode({
      "k1": "v1",
      "k2": "v2",
    })).to.eql(Buffer.from("d2:k12:v12:k22:v2e"));
  });

  it("deve ordenar as chaves na codificação de dicionários", () => {
    expect(encode({
      "k2": "v2",
      "k1": "v1",
    })).to.eql(Buffer.from("d2:k12:v12:k22:v2e"));
  });
});