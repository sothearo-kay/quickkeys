import type { ResultsState, TestMode } from "./typing";

export interface Player {
  id: string;
  username: string;
  joinedAt: number;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  isConnected: boolean;
  results?: ResultsState;
}

export interface RoomState {
  code: string;
  host: string;
  players: Map<string, Player>;
  mode: TestMode;
  timeLimit: number;
  wordList: string[];
  started: boolean;
  startedAt?: number;
  finishedAt?: number;
}

// Client-side room state (players as array, sent via sync)
export interface RoomClientState {
  code: string;
  host: string;
  players: Player[];
  mode: TestMode;
  timeLimit: number;
  wordList: string[];
  started: boolean;
  startedAt?: number;
}

export interface ChatMessage {
  userId: string;
  username: string;
  text: string;
}

export interface LiveProgress {
  progress: number;
  wpm: number;
  accuracy: number;
}

export type RoomMessageType
  = | "join"
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
  progress: number;
  wpm: number;
  accuracy: number;
}

export interface FinishData {
  results: ResultsState;
}

export interface SyncData {
  room: RoomClientState;
}
