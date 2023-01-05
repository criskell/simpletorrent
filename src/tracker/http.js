import bencode from "../bencode/encoding";
import { parseCompactPeerList } from "./compact-peer-list.js";

class HttpTrackerClient {
  constructor(httpClient, announceUrl) {
    this._httpClient = httpClient;
    this._announceUrl = announceUrl;
  }

  async announce(request) {
    const { data } = await this._httpClient.getBuffer(this._announceUrl, {
      params: this._makeSearchParams(request),
    });

    let response;

    try {
      response = bencode.decode(rawResponse);
    } catch (decodeError) {
      throw new Error(`Ocorreu um erro durante a análise da resposta de anúncio do tracker ${announceOptions.url}`, {
        cause: decodeError,
      });
    }

    if (response["failure reason"]) {
      throw new Error(`O tracker ${announceOptions.url} retornou uma falha: ${response["failure reason"]}`);
    }

    return {
      interval: response.interval,
      peers: parseCompactPeerList(response.peers),
    };
  }

  _makeSearchParams({
    infohash,
    peerId,
    port,
    uploaded,
    downloaded,
    left,
    event,
    ip,
    numwant,
    key,
  }) {
    return {
      info_hash: infohash,
      peer_id: peerId,
      port,
      uploaded,
      downloaded,
      left,
      compact: 1,
      event,
      ip,
      numwant,
      key,
    };
  }
}
