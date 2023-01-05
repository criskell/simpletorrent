import dgram from "node:dgram";

import { randomBytes } from "../crypto.js";
import { parseCompactPeerList } from "./compact-peer-list.js";

class UdpTrackerClient {
  constructor(makeUdpSocket, announceUrl) {
    this._makeUdpSocket = makeUdpSocket;
    this._announceUrl = announceUrl;
  }

  async announce(request) {
    return new Promise(async (resolve, reject) => {
      let currentTransactionId = await this._generateTransactionId();

      const socket = this._makeUdpSocket("udp4");

      const destination = {
        address: this._announceUrl.hostname,
        port: this._announceUrl.port,
      };

      const handleIncomingMessage = async (message) => {
        const action = message.readUInt32BE(0);
        const transactionId = message.readUInt32BE(4);

        if (transactionId !== currentTransactionId) {
          throw new Error(`O tracker "${url}" enviou um ID de transação inválido.`);
        }

        if (action === ACTIONS.CONNECT) {
          const connectionId = message.slice(8);

          currentTransactionId = await this._generateTransactionId();

          return sendMessage(
            makeAnnounceRequest(
              currentTransactionId,
              connectionId,
              announceOptions
            )
          );
        }

        if (action === ACTIONS.ANNOUNCE) {
          socket.close();

          return resolve(parseAnnounceResponse(message.slice(8)));
        }
      };
      
      socket.on("error", reject);
      socket.on("message", handleIncomingMessage);

      await sendMessage(makeConnectRequest(currentTransactionId));
    });
  }

  async _sendMessage (socket, message) {
    return new Promise((resolve, reject) => {
      socket.send(
        message,
        0,
        message.length,
        this._port,
        this._address,
        (err) => {
          if (err) return reject(err);

          resolve();
        }
      );
    });
  }

  async _generateTransactionId() {
    return (await crypto.randomBytes(4)).readUInt32BE(0);
  }
}

const ACTIONS = {
  CONNECT: 0,
  ANNOUNCE: 1,
};

const makeConnectRequest = (transactionId) => {
  const request = Buffer.alloc(16);

  // Identificador do protocolo - Constante mágica
  request.writeUInt32BE(0x417, 0);
  request.writeUInt32BE(0x27101980, 4);

  // Ação que deseja executar: CONNECT (conectar)
  request.writeUInt32BE(ACTIONS.CONNECT, 8);

  // ID da transação fornecida
  request.writeUInt32BE(transactionId, 12);

  return request;
};

const makeAnnounceRequest = (
  transactionId,
  connectionId,
  {
    peerId,
    infohash,
    event = "empty",
    left,
    downloaded,
    uploaded,
    key,
    peerCount = -1,
    port,
    ip = 0,
  }
) => {
  const request = Buffer.alloc(98);

  // ID de conexão
  connectionId.copy(request, 0);

  // Ação que se deseja executar
  request.writeUInt32BE(ACTIONS.ANNOUNCE, 8);

  // ID da transação
  request.writeUInt32BE(transactionId, 12);

  // Infohash
  infohash.copy(request, 16);

  // ID do peer
  peerId.copy(request, 36);

  // Quanto de bytes foram baixados
  request.writeBigUInt64BE(downloaded, 56);

  // Quanto de bytes ainda restam para serem baixados
  request.writeBigUInt64BE(left, 64);

  // Quanto de bytes foram carregados
  request.writeBigUInt64BE(uploaded, 72);

  // Evento
  request.writeUInt32BE(event, 80);

  // Endereço IP
  request.writeUInt32BE(0, 84);

  // Chave
  key.copy(request, 88);  

  // Quantidade de peers
  request.writeInt32BE(peerCount, 92);

  // Porta
  request.writeUInt16BE(port, 96);

  return request;
};

const parseAnnounceResponse = (response) => {
  return {
    interval: response.readUInt32BE(0),
    leecherCount: response.readUInt32BE(4),
    seederCount: response.readUInt32BE(8),
    peers: parseCompactPeerList(response.slice(12)),
  };
};