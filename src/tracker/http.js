import http from "http";
import https from "https";
import bencode from "bencode";

import { ACTIONS } from "./enums.js";
import { randomBytes } from "../crypto.js";
import { parseCompactPeerList } from "./compact-peer-list.js";

export const announce = async (announceOptions) => {
  const searchParams = makeSearchParams(announceOptions);

  const fullUrl = mergeURLWithParams(
    announceOptions.url,
    searchParams
  );

  const rawResponse = await sendGetRequest(fullUrl);

  let response;

  try {
    response = bencode.decode(rawResponse);
  } catch (parseError) {
    const error = new Error(`Ocorreu um erro durante a análise da resposta de anúncio do tracker ${announceOptions.url}`);

    error.cause = parseError;

    throw error;
  }

  if (response["failure reason"]) {
    throw new Error(`O tracker ${announceOptions.url} retornou uma falha: ${response["failure reason"]}`);
  }

  return {
    interval: response.interval,
    peers: parseCompactPeerList(response.peers),
  };
};

const sendGetRequest = (urlWithParams) => {
  const sendRequest = urlWithParams.protocol === "http:" ? http.get : https.get;

  return new Promise((resolve, reject) => {
    sendRequest(urlWithParams, (response) => {
      let fullRawResponse = Buffer.alloc(0);

      response.on("error", reject);
      response.on("data", (chunk) => {
        fullRawResponse = Buffer.concat([fullRawResponse, chunk]);
      });
      response.on("end", () => {
        resolve(fullRawResponse);
      });
    }).on("error", reject);
  });
};

const mergeURLWithParams = (url, params) => {
  const encodedParams = Object.entries(params)
    .map(([k, v]) => `${k}=${escape(v)}`)
    .join("&");

  const finalUrl = new URL(
    "?" + encodedParams,
    url
  );

  return finalUrl;
};

const makeSearchParams = ({
  infohash,
  peerId,
  stats: {
    uploaded,
    downloaded,
    left,
  },
  port
}) => {
  return {
    info_hash: infohash.toString("binary"),
    peer_id: peerId.toString("binary"),
    uploaded: uploaded.toString(),
    downloaded: downloaded.toString(),
    left: left.toString(),
    port,
    compact: 1,
  };
};