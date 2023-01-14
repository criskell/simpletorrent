export const writeChunkedBuffer = (writable, message, chunkSize) => {
  for (let i = 0; i < message.length; i += chunkSize) {
    writable.write(message.subarray(i, i + chunkSize));
  }
};

export const drainReadableStream = async (readableStream) => {
  const chunks = [];

  for await (const buffer of readableStream) {
    chunks.push(buffer);
  }

  return readableStream.readableObjectMode ? chunks : Buffer.concat(chunks);
};