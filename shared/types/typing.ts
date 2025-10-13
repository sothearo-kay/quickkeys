export type WordListType = "sentences" | "words";

export interface WordState {
  currWord: string;
  typedWord: string;
  typedHistory: string[];
  wordList: string[];
}

export interface TimeState {
  timer: number;
  timerId: ReturnType<typeof setTimeout> | null;
}

export interface PreferencesState {
  theme: string;
  timeLimit: number;
  type: WordListType;
}
