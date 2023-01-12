import { expect } from "chai";

import { decode } from "./decode.js";

describe("bencode/decode", () => {
  it("deve decodificar um inteiro", () => {
    expect(decode(Buffer.from("i10e"))).to.equal(10);
  });

  it("deve decodificar uma lista", () => {
    expect(decode(Buffer.from("li1ei2ei3ei4ei5ee"))).to.eql([1, 2, 3, 4, 5]);
  });

  it("deve decodificar um dicionário", () => {
    expect(decode(Buffer.from("d1:ai1e1:bi5ee"))).to.eql({ a: 1, b: 5 });
  });

  it("deve decodificar um bytestring", () => {
    expect(decode(Buffer.from("2:aa"))).to.eql(Buffer.from("aa"));
  });
});
