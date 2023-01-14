import { expect } from "chai";

import { parseArgs } from "./args-parser.js";

describe("parseArgs", () => {
  it("should return empty object when no arguments passed", () => {
    expect(parseArgs([])).to.be.eql({
      values: [],
      longOptions: {},
      shortOptions: {},
    });
  });

  it("should parse normal values", () => {
    const args = parseArgs(["foo", "bar"]);

    expect(args.values).to.be.eql(["foo", "bar"]);
  });

  it("should parse short options", () => {
    const args = parseArgs(["-x", "a", "-y"]);

    expect(args.shortOptions).to.be.eql({
      "x": "a",
      "y": "",
    });
  });

  it("should parse long options", () => {
    const args = parseArgs(["--x", "a", "--y"]);

    expect(args.longOptions).to.be.eql({
      "x": "a",
      "y": "",
    });
  });

  it("should parse normal values and short/long options together", () => {
    const args = parseArgs(["--x", "a", "--y", "-f", "foo", "bar", "-g", "-h", "a", "example"]);

    expect(args.longOptions).to.be.eql({
      "x": "a",
      "y": "",
    });

    expect(args.values).to.be.eql([
      "bar",
      "example"
    ]);

    expect(args.shortOptions).to.be.eql({
      "f": "foo",
      "g": "",
      "h": "a",
    });
  });
});