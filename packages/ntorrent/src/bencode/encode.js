export class EncodeError extends Error {
  constructor(message) {
    super(message);
    this.name = "EncodeError";
  }
}

export const encode = (value) => {  
  // Inteiros
  if (typeof value === "number" || value === "bigint") return encodeInteger(value);
 
  // Bytestrings
  if (Buffer.isBuffer(value) || typeof value === "string") return encodeBytestring(value);

  // Mapas
  if (value instanceof Map) return encodeDict(Array.from(value));

  // Iteráveis
  if (typeof value[Symbol.iterator] === "function") return encodeList(value);

  // Objetos
  if (typeof value === "object") return encodeDict(Object.entries(value));

  throw new EncodeError(`Não é possível codificar valores do tipo ${typeof value}`);
};

const encodeBytestring = (value) => {
  const buffer = Buffer.from(value, "utf8");
  const length = Buffer.from(`${buffer.length}:`, "ascii");

  return Buffer.concat([
    length,
    buffer,
  ]);
};

const encodeList = (iterable) => {
  return Buffer.concat([
    Buffer.from("l"),
    ...Array.from(iterable).map(encode),
    Buffer.from("e"),
  ]);
};

const encodeInteger = (number) => {
  const numericString = Number(number).toString();
    
  return Buffer.from("i" + numericString + "e", "ascii");
};

const encodeDict = (entries) => {
  const encodedEntries = entries
    .sort(([key1,], [key2,]) => {
      if (key1 < key2) return -1;
      if (key1 > key2) return 1;
      return 0;
    })
    .map(([key, value]) => [encode(key), encode(value)])
    .flat();

  return Buffer.concat([
    Buffer.from("d"),
    ...encodedEntries,
    Buffer.from("e"),
  ]);
};