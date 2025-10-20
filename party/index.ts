import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    console.log(`Connected: ${conn.id} to room: ${this.room.id}`);
    conn.send(JSON.stringify({ type: "connected", id: conn.id }));
  }

  onMessage(message: string, sender: Party.Connection) {
    console.log(`Message from ${sender.id}: ${message}`);
    // Broadcast to everyone including sender
    this.room.broadcast(JSON.stringify({
      type: "message",
      from: sender.id,
      data: message,
    }));
  }
}

Server satisfies Party.Worker;
