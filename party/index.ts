import type * as Party from "partykit/server";

interface Player {
  id: string;
  username: string;
  joinedAt: number;
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    console.log(`Connected: ${conn.id} to room: ${this.room.id}`);

    // Check if room is initialized
    const isInitialized = await this.room.storage.get("initialized");

    conn.send(JSON.stringify({
      type: "connected",
      id: conn.id,
      roomExists: !!isInitialized,
    }));

    // Send current players list
    const players = await this.room.storage.get<Player[]>("players") || [];
    conn.send(JSON.stringify({
      type: "players-update",
      players,
    }));
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);

      if (data.type === "create") {
        // Mark room as initialized
        await this.room.storage.put("initialized", true);
        await this.room.storage.put("players", []);
        console.log(`Room ${this.room.id} created`);

        sender.send(JSON.stringify({
          type: "room-created",
          roomCode: this.room.id,
        }));
      }
      else if (data.type === "join") {
        const isInitialized = await this.room.storage.get("initialized");

        if (!isInitialized) {
          sender.send(JSON.stringify({
            type: "error",
            message: "Room does not exist",
          }));
          return;
        }

        // Add player to room
        const players = await this.room.storage.get<Player[]>("players") || [];
        const newPlayer: Player = {
          id: sender.id,
          username: data.username,
          joinedAt: Date.now(),
        };

        // Check if player already exists (reconnection)
        const existingIndex = players.findIndex(p => p.id === sender.id);
        if (existingIndex === -1) {
          players.push(newPlayer);
          await this.room.storage.put("players", players);

          console.log(`${data.username} joined room ${this.room.id}`);

          // Broadcast player joined and updated players list
          this.room.broadcast(JSON.stringify({
            type: "players-update",
            players,
          }));
        }
      }
      else if (data.type === "message") {
        console.log(`${data.username}: ${data.text}`);
        this.room.broadcast(JSON.stringify({
          type: "message",
          userId: sender.id,
          from: data.username,
          data: data.text,
        }));
      }
    }
    catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  async onClose(conn: Party.Connection) {
    // Remove player from room
    const players = await this.room.storage.get<Player[]>("players") || [];
    const updatedPlayers = players.filter(p => p.id !== conn.id);
    await this.room.storage.put("players", updatedPlayers);

    // Broadcast updated players list
    this.room.broadcast(JSON.stringify({
      type: "players-update",
      players: updatedPlayers,
    }));
  }
}

Server satisfies Party.Worker;
