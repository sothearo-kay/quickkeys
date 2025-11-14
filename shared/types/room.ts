import type { ResultsState, TestMode } from "./typing";

export interface Player {
  id: string;
  username: string;
  isReady: boolean;
  progress: number; // Current word index
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  results?: ResultsState;
}

export interface RoomState {
  code: string;
  host: string; // Player ID of the host
  players: Map<string, Player>;
  mode: TestMode;
  timeLimit: number;
  wordList: string[];
  started: boolean;
  startedAt?: number;
  finishedAt?: number;
}

export type RoomMessageType =
  | "join"
  | "leave"
  | "ready"
  | "unready"
  | "start"
  | "progress"
  | "finish"
  | "sync";

export interface RoomMessage {
  type: RoomMessageType;
  playerId: string;
  data?: any;
}

export interface JoinRoomData {
  username: string;
}

export interface ProgressData {
  progress: number; // Current word index
  wpm: number;
  accuracy: number;
}

export interface FinishData {
  results: ResultsState;
}

export interface SyncData {
  room: Omit<RoomState, "players"> & { players: Player[] };
}
