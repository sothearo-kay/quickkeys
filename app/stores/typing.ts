interface WordState {
  currWord: string;
  typedWord: string;
  typedHistory: string[];
  wordList: string[];
  activeWordRef: Ref<HTMLDivElement | null> | null;
  caretRef: Ref<HTMLSpanElement | null> | null;
}

interface TimeState {
  timer: number;
  timerId: ReturnType<typeof setTimeout> | null;
}

interface PreferencesState {
  theme: string;
  timeLimit: number;
  type: string;
}

export const useTypingStore = defineStore("typing", () => {
  const preferences = reactive<PreferencesState>({
    theme: "default",
    timeLimit: 60,
    type: "sentences",
  });

  const word = reactive<WordState>({
    currWord: "",
    typedWord: "",
    typedHistory: [],
    wordList: [],
    activeWordRef: null,
    caretRef: null,
  });

  const time = reactive<TimeState>({
    timer: 0,
    timerId: null,
  });

  return { preferences, word, time };
});
