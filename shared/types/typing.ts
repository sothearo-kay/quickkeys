export type TestMode = "sentences" | "words";

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
  timeLimit: number;
  mode: TestMode;
}

export interface ResultsState {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  isFinished: boolean;
  showResults: boolean;
}
