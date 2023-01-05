export const encodeComponent = (component) => {
  const str = Buffer.isBuffer(component)
    ? component.toString("binary")
    : component.toString();

  return str.split("").map((character) => {
    if (bypassPercentEncoding(character)) return character;
    return percentEncode(character.charCodeAt(0));
  }).join("");
};

const percentEncode = (codeunit) => {
  const hexadecimal = codeunit.toString(16).toUpperCase();

  return codeunit <= 0xff
    ? `%${hexadecimal.padStart(2, "0")}`
    : `%u${hexadecimal.padStart(4, "0")}`;
};

const bypassPercentEncoding = (character) => {
  const isAlphanumeric = (character >= "a" && character <= "z")
    || (character >= "A" && character <= "Z")
    || (character >= "0" && character <= "9");

  return isAlphanumeric || [".", "-", "_", "~"].includes(character);
};