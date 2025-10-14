export const useTypingStore = defineStore("typing", () => {
  const preferences = reactive<PreferencesState>({
    timeLimit: 30,
    mode: "sentences",
  });

  const word = reactive<WordState>({
    currWord: "",
    typedWord: "",
    typedHistory: [],
    wordList: [],
  });

  const time = reactive<TimeState>({
    timer: 0,
    timerId: null,
  });

  const results = reactive<ResultsState>({
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    incorrectChars: 0,
    isFinished: false,
    showResults: false,
  });

  const activeWordRef = ref<HTMLDivElement | null>(null);
  const caretBlink = ref(true);
  const hasStarted = ref(false);

  const isTyping = computed(() => hasStarted.value && !results.isFinished);

  let blinkTimeout: ReturnType<typeof setTimeout> | null = null;

  async function loadWordList(type: string): Promise<string[]> {
    try {
      const module = await import(`~/data/wordlists/${type}.json`);
      const data = module.default as string[];

      if (type === "sentences") {
        return shuffleArray(data).flatMap(sentence => sentence.split(" "));
      }

      return shuffleArray(data);
    }
    catch (error) {
      console.error(`Failed to load word list for type "${type}":`, error);
      return [];
    }
  }

  async function reloadWordList() {
    const words = await loadWordList(preferences.mode);
    word.wordList = words;
    word.currWord = word.wordList[0] ?? "";
  }

  async function init() {
    if (word.wordList.length > 0)
      return;

    await reloadWordList();
    time.timer = preferences.timeLimit;
  }

  const { pause: pauseTimer, resume: resumeTimer, isActive } = useIntervalFn(
    () => {
      time.timer--;
      if (time.timer <= 0) {
        pauseTimer();

        results.isFinished = true;
        calculateResults();

        setTimeout(() => {
          results.showResults = true;
        }, 200);
      }
    },
    1000,
    { immediate: false },
  );

  function startTimer() {
    if (hasStarted.value || isActive.value)
      return;

    hasStarted.value = true;
    resumeTimer();
  }

  function stopTimer() {
    pauseTimer();
    if (blinkTimeout) {
      clearTimeout(blinkTimeout);
      blinkTimeout = null;
    }
  }

  function calculateResults() {
    const typedHistory = toRaw(word.typedHistory);
    const wordList = toRaw(word.wordList);

    let correctChars = 0;
    let incorrectChars = 0;

    // Calculate correct and incorrect characters
    for (let i = 0; i < typedHistory.length; i++) {
      const typedWord = typedHistory[i] || "";
      const actualWord = wordList[i] || "";

      for (let j = 0; j < Math.max(typedWord.length, actualWord.length); j++) {
        if (j < actualWord.length && typedWord[j] === actualWord[j]) {
          correctChars++;
        }
        else if (j < typedWord.length) {
          incorrectChars++;
        }
        else {
          incorrectChars++;
        }
      }
    }

    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

    // WPM = (correct characters / 5) / time in minutes
    // Standard word = 5 characters
    const timeInMinutes = preferences.timeLimit / 60;
    const wpm = Math.round((correctChars / 5) / timeInMinutes);

    Object.assign(results, {
      wpm,
      accuracy: Math.round(accuracy),
      correctChars,
      incorrectChars,
      isFinished: true,
    });
  }

  async function restart() {
    stopTimer();

    if (results.isFinished)
      await reloadWordList();

    word.typedWord = "";
    word.typedHistory = [];
    word.currWord = word.wordList[0] ?? "";
    time.timer = preferences.timeLimit;
    hasStarted.value = false;
    Object.assign(results, {
      wpm: 0,
      accuracy: 0,
      correctChars: 0,
      incorrectChars: 0,
      isFinished: false,
      showResults: false,
    });
  }

  function setChar(char: string) {
    // Limit extra characters to word length + 20
    const maxLength = word.currWord.length + 20;
    if (word.typedWord.length < maxLength) {
      word.typedWord += char;
    }
  }

  function removeChar() {
    if (word.typedWord.length > 0) {
      word.typedWord = word.typedWord.slice(0, -1);
    }
    else if (word.typedHistory.length > 0) {
      // Go back to the previous word
      const previousWord = word.typedHistory.pop() || "";
      word.typedWord = previousWord;
      word.currWord = word.wordList[word.typedHistory.length] ?? "";
    }
  }

  function appendTypedHistory() {
    word.typedHistory.push(word.typedWord);
    word.typedWord = "";

    const nextIndex = word.typedHistory.length;
    if (nextIndex < word.wordList.length)
      word.currWord = word.wordList[nextIndex] ?? "";
  }

  function handleCaretBlink() {
    if (results.isFinished)
      return;

    if (blinkTimeout)
      clearTimeout(blinkTimeout);

    caretBlink.value = false;
    blinkTimeout = setTimeout(() => {
      caretBlink.value = true;
    }, 500);
  }

  function scrollActiveWordIntoView() {
    const activeWord = activeWordRef.value;
    if (!activeWord)
      return;

    activeWord.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleKeyPress(key: string, ctrlKey = false) {
    if (results.isFinished) {
      stopTimer();
      return;
    }

    // Start timer on first keypress
    if (!hasStarted.value && key.length === 1) {
      startTimer();
    }

    switch (key) {
      case " ":
        if (word.typedWord.length > 0)
          appendTypedHistory();
        break;

      case "Backspace":
        ctrlKey ? (word.typedWord = "") : removeChar();
        break;

      default:
        if (key.length === 1)
          setChar(key);
        break;
    }

    handleCaretBlink();
    scrollActiveWordIntoView();
  }

  return {
    preferences,
    word,
    time,
    results,
    activeWordRef,
    caretBlink,
    isTyping,
    init,
    restart,
    reloadWordList,
    handleKeyPress,
  };
});
