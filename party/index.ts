import type * as Party from "partykit/server";

interface PlayerResults {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
}

interface Player {
  id: string; // persistent playerId from client localStorage
  username: string;
  joinedAt: number;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  isConnected: boolean;
  results?: PlayerResults;
}

interface RoomState {
  code: string;
  host: string; // persistent playerId
  players: Player[];
  mode: "words" | "sentences";
  timeLimit: number;
  wordList: string[];
  started: boolean;
  startedAt?: number;
}

// playerId → connId
type Sessions = Record<string, string>;

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  private async getRoom(): Promise<RoomState | null> {
    return (await this.room.storage.get<RoomState>("room")) ?? null;
  }

  private async saveRoom(room: RoomState): Promise<void> {
    await this.room.storage.put("room", room);
  }

  private async getSessions(): Promise<Sessions> {
    return (await this.room.storage.get<Sessions>("sessions")) ?? {};
  }

  private async saveSessions(sessions: Sessions): Promise<void> {
    await this.room.storage.put("sessions", sessions);
  }

  private send(conn: Party.Connection, data: unknown): void {
    conn.send(JSON.stringify(data));
  }

  private broadcast(data: unknown, exclude?: string[]): void {
    this.room.broadcast(JSON.stringify(data), exclude);
  }

  // Look up a player's persistent ID from their current conn.id
  private async getPlayerIdByConn(connId: string): Promise<string | null> {
    const sessions = await this.getSessions();
    return Object.entries(sessions).find(([, cid]) => cid === connId)?.[0] ?? null;
  }

  async onConnect(conn: Party.Connection): Promise<void> {
    // Just confirm the connection — client will identify themselves via create/join/rejoin
    this.send(conn, { type: "connected" });
  }

  async onMessage(message: string, sender: Party.Connection): Promise<void> {
    let msg: any;
    try {
      msg = JSON.parse(message);
    }
    catch {
      return;
    }

    switch (msg.type) {
      case "create": {
        const { username, playerId } = msg.data;
        const player: Player = {
          id: playerId,
          username,
          joinedAt: Date.now(),
          isReady: false,
          progress: 0,
          wpm: 0,
          accuracy: 0,
          isFinished: false,
          isConnected: true,
        };
        const room: RoomState = {
          code: this.room.id,
          host: playerId,
          players: [player],
          mode: "words",
          timeLimit: 30,
          wordList: [],
          started: false,
        };
        const sessions: Sessions = { [playerId]: sender.id };
        await this.saveRoom(room);
        await this.saveSessions(sessions);
        this.broadcast({ type: "sync", room });
        break;
      }

      case "join": {
        const { username, playerId } = msg.data;
        const room = await this.getRoom();
        if (!room) {
          this.send(sender, { type: "error", message: "Room does not exist" });
          return;
        }
        if (room.started) {
          this.send(sender, { type: "error", message: "Game already in progress" });
          return;
        }
        const sessions = await this.getSessions();
        const existing = room.players.find(p => p.id === playerId);
        if (!existing) {
          room.players.push({
            id: playerId,
            username,
            joinedAt: Date.now(),
            isReady: false,
            progress: 0,
            wpm: 0,
            accuracy: 0,
            isFinished: false,
            isConnected: true,
          });
        }
        else {
          existing.isConnected = true;
          existing.username = username;
        }
        sessions[playerId] = sender.id;
        await this.saveRoom(room);
        await this.saveSessions(sessions);
        this.broadcast({ type: "sync", room });
        break;
      }

      case "rejoin": {
        const { username, playerId } = msg.data;
        const room = await this.getRoom();
        if (!room) {
          this.send(sender, { type: "error", message: "Room does not exist" });
          return;
        }
        const sessions = await this.getSessions();
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          // Known player — reconnect
          player.isConnected = true;
          player.username = username;
        }
        else if (!room.started) {
          // Unknown player, lobby still open — add as new
          room.players.push({
            id: playerId,
            username,
            joinedAt: Date.now(),
            isReady: false,
            progress: 0,
            wpm: 0,
            accuracy: 0,
            isFinished: false,
            isConnected: true,
          });
        }
        else {
          this.send(sender, { type: "error", message: "Game already in progress" });
          return;
        }
        sessions[playerId] = sender.id;
        await this.saveRoom(room);
        await this.saveSessions(sessions);
        this.broadcast({ type: "sync", room });
        break;
      }

      case "ready": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        const room = await this.getRoom();
        if (!playerId || !room || room.started)
          return;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          player.isReady = !player.isReady;
          await this.saveRoom(room);
          this.broadcast({ type: "sync", room });
        }
        break;
      }

      case "settings": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        const room = await this.getRoom();
        if (!playerId || !room || room.host !== playerId || room.started)
          return;
        if (msg.data.mode !== undefined)
          room.mode = msg.data.mode;
        if (msg.data.timeLimit !== undefined)
          room.timeLimit = msg.data.timeLimit;
        await this.saveRoom(room);
        this.broadcast({ type: "sync", room });
        break;
      }

      case "start": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        const room = await this.getRoom();
        if (!playerId || !room || room.host !== playerId || room.started)
          return;
        // All non-host players must be ready
        const nonHost = room.players.filter(p => p.id !== room.host);
        if (nonHost.some(p => !p.isReady))
          return;
        room.wordList = msg.data.wordList;
        room.started = true;
        room.startedAt = Date.now() + 3500;
        await this.saveRoom(room);
        this.broadcast({ type: "sync", room });
        break;
      }

      case "progress": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        if (!playerId)
          return;
        this.broadcast(
          { type: "progress", playerId, data: msg.data },
          [sender.id],
        );
        break;
      }

      case "finish": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        const room = await this.getRoom();
        if (!playerId || !room || !room.started)
          return;
        const player = room.players.find(p => p.id === playerId);
        if (player && !player.isFinished) {
          player.isFinished = true;
          player.results = msg.data.results as PlayerResults;
          player.wpm = msg.data.results.wpm;
          player.accuracy = msg.data.results.accuracy;
          await this.saveRoom(room);
          this.broadcast({ type: "sync", room });
        }
        break;
      }

      case "restart": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        const room = await this.getRoom();
        if (!playerId || !room || room.host !== playerId)
          return;
        room.started = false;
        room.startedAt = undefined;
        room.wordList = [];
        room.players = room.players
          .filter(p => p.isConnected)
          .map(p => ({
            ...p,
            isReady: false,
            progress: 0,
            wpm: 0,
            accuracy: 0,
            isFinished: false,
            results: undefined,
          }));
        await this.saveRoom(room);
        this.broadcast({ type: "sync", room });
        break;
      }

      case "message": {
        const playerId = await this.getPlayerIdByConn(sender.id);
        if (!playerId)
          return;
        this.broadcast({
          type: "message",
          userId: playerId,
          from: msg.username,
          data: msg.text,
        });
        break;
      }
    }
  }

  async onClose(conn: Party.Connection): Promise<void> {
    const room = await this.getRoom();
    if (!room)
      return;

    const sessions = await this.getSessions();
    const playerId = Object.entries(sessions).find(([, cid]) => cid === conn.id)?.[0];
    if (!playerId)
      return;

    if (room.started) {
      // Game in progress: mark as disconnected so they can rejoin
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.isConnected = false;
        // Transfer host if needed
        if (room.host === playerId) {
          const next = room.players.find(p => p.id !== playerId && p.isConnected);
          if (next) {
            room.host = next.id;
          }
          else {
            // No connected players left — clean up
            await this.room.storage.delete("room");
            await this.room.storage.delete("sessions");
            return;
          }
        }
        await this.saveRoom(room);
        this.broadcast({ type: "sync", room });
      }
    }
    else {
      // In lobby: remove the player
      room.players = room.players.filter(p => p.id !== playerId);
      delete sessions[playerId];

      if (room.players.length === 0) {
        await this.room.storage.delete("room");
        await this.room.storage.delete("sessions");
        return;
      }

      if (room.host === playerId) {
        room.host = room.players[0]!.id;
      }

      await this.saveRoom(room);
      await this.saveSessions(sessions);
      this.broadcast({ type: "sync", room });
    }
  }
}

Server satisfies Party.Worker;
