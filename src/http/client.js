import http from "http";
import https from "https";
import util from "util";

import { encodeSearchParams } from "./search-params.js";
import { drainReadableStream } from "../util/stream.js";

const promisifiedHttp = {
  get: util.promisify(http.get),
};

const promisifiedHttps = {
  get: util.promisify(https.get),
};

export class HttpClient {
  async getBuffer(urlString, options = {}) {
    const { url, client } = this._getPromisifiedClient(urlString);

    const encodedSearchParams = encodeSearchParams(options.params);
    const response = await client.get(new URL(encodedSearchParams, url));
    const data = await drainReadableStream(response);

    return {
      ...response,
      data,
    };
  }

  _getPromisifiedClient(urlString) {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "http:" ? promisifiedHttp : promisifiedHttps;

    return { client, url };
  }
}