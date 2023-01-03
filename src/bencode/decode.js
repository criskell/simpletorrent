const INTEGER_START = "i".charCodeAt(0);
const LIST_START = "l".charCodeAt(0);
const DICTIONARY_START = "d".charCodeAt(0);
const END_DELIMITER = "e".charCodeAt(0);
const ALPHA_START = "0".charCodeAt(0);
const ALPHA_END = "9".charCodeAt(0);

export class DecodeError extends Error {
  constructor(message) {
    super(message);
    this.name = "DecodeError";
  }
}

export const decode = (buffer) => {
  const { value } = consumeValue(buffer, 0);

  return value;
};

const consumeValue = (buffer, cursor) => {
  const currentByte = buffer[cursor];

  if (currentByte === DICTIONARY_START) return consumeDictionary(buffer, cursor);
  if (currentByte === INTEGER_START) return consumeInteger(buffer, cursor);
  if (currentByte === LIST_START) return consumeList(buffer, cursor);
  if (currentByte === undefined) throw new DecodeError(`Um valor era esperado na posição ${cursor}, mas nada foi encontrado.`);

  if (currentByte >= ALPHA_START && currentByte <= ALPHA_END) return consumeBytestring(buffer, cursor);

  throw new DecodeError(`Byte 0x${currentByte.toString(16)} não esperado na posição ${cursor}.`);
};

const consumeBytestring = (buffer, cursor) => {
  const colonIndex = buffer.indexOf(":", cursor);
  const rawLength = buffer.slice(cursor, colonIndex);
  const length = parseInt(rawLength.toString("ascii"));

  cursor += rawLength.length + 1;

  if (!Number.isFinite(length))
    throw new DecodeError(`Comprimento de string inválido na posição ${cursor}.`);

  if (length < 0)
    throw new DecodeError(`Comprimento de string negativo na posição ${cursor}.`);

  const value = buffer.slice(cursor, cursor + length);

  return { value, cursor: cursor + length };
};

const consumeInteger = (buffer, cursor) => {
  cursor += 1;

  const endDelimiterIndex = buffer.indexOf(END_DELIMITER, cursor);

  if (endDelimiterIndex < 0)
    throw new DecodeError(`Delimitador do final do inteiro não encontrado.`);

  const integer = parseInt(buffer.slice(cursor, endDelimiterIndex).toString("ascii"));

  cursor = endDelimiterIndex + 1;

  return { value: integer, cursor };
};

const consumeList = (buffer, cursor) => {
  const list = [];

  cursor++; // Ignora o delimitador de início da lista

  while (!hasExpectedByte(buffer, cursor, END_DELIMITER)) {
    const { value, cursor: updatedCursor } = consumeValue(buffer, cursor);

    list.push(value);

    cursor = updatedCursor;
  }

  cursor++; // Ignora o delimitador de término da lista

  return { cursor, value: list };
};

const consumeDictionary = (buffer, cursor) => {
  cursor++; // Ignora o delimitador de início do dicionário

  const dict = {};

  while (!hasExpectedByte(buffer, cursor, END_DELIMITER)) {
    // Ler a chave do par chave/valor
    const { value: rawKey, cursor: valueCursor } = consumeValue(buffer, cursor);

    if (!Buffer.isBuffer(rawKey)) {
      throw new DecodeError(`A chave de um par chave/valor que começa na posição ${cursor} deveria ser do tipo bytestring.`);
    }

    // Atualiza o cursor para onde a chave termina
    // A chave termina onde o valor começa
    cursor = valueCursor;

    // Converte a chave para UTF8
    const key = rawKey.toString("utf8");

    // Ler o valor do par chave/valor
    const { value, cursor: updatedCursor } = consumeValue(buffer, cursor);

    // Atualiza o cursor para onde o valor termina
    // O próximo par chave/valor começa onde o valor termina
    cursor = updatedCursor;

    dict[key] = value;
  }

  cursor++; // Ignore o delimitador de término do dicionário

  return { cursor, value: dict };
};

const hasExpectedByte = (buffer, cursor, byte) => {
  const currentByte = buffer[cursor];

  if (currentByte === undefined)
    throw new DecodeError(`Ao procurar o byte 0x${byte.toString(16)} (${String.fromCharCode(byte)}) na posição ${cursor} o fim foi encontrado.`);

  return currentByte === byte;
};
