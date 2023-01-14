import { expect } from "chai";

import { decode } from "./decode.js";

describe("bencode.decode", () => {
  it("should decode an integer", () => {
    expect(decode(Buffer.from("i10e"))).to.equal(10);
  });

  it("should decode an list", () => {
    expect(decode(Buffer.from("li1ei2ei3ei4ei5ee"))).to.eql([1, 2, 3, 4, 5]);
  });

  it("must decode an dictionary", () => {
    expect(decode(Buffer.from("d1:ai1e1:bi5ee"))).to.eql({ a: 1, b: 5 });
  });

  it("must decode an bytestring", () => {
    expect(decode(Buffer.from("2:aa"))).to.eql(Buffer.from("aa"));
  });
});
