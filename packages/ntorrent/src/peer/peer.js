export class Peer {
  constructor(contact, tcpConnectionCreator) {
    this.contact = contact;
    this._tcpConnectionCreator = tcpConnectionCreator;
  }
}