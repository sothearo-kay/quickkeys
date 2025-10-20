import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    console.log(`Connected: ${conn.id} to room: ${this.room.id}`);
    conn.send(JSON.stringify({ type: "connected", id: conn.id }));
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);

      if (data.type === "join") {
        console.log(`${data.username} joined room ${this.room.id}`);
        this.room.broadcast(JSON.stringify({
          type: "system",
          data: `${data.username} joined the room`,
        }));
      }
      else if (data.type === "message") {
        console.log(`${data.username}: ${data.text}`);
        this.room.broadcast(JSON.stringify({
          type: "message",
          from: data.username,
          data: data.text,
        }));
      }
    }
    catch (error) {
      console.error("Error parsing message:", error);
    }
  }
}

Server satisfies Party.Worker;
