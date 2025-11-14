export const useTypingStore = defineStore("typing", () => {
  const activeElement = useActiveElement();

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

  const keystrokeStats = {
    correct: 0,
    incorrect: 0,
  };

  const activeWordRef = ref<HTMLDivElement | null>(null);
  const caretBlink = ref(true);
  const hasStarted = ref(false);

  const isTyping = computed(() => hasStarted.value && !results.isFinished);

  async function reloadWordList() {
    const words = await loadWordList(preferences.mode);
    word.wordList = words;
    word.currWord = word.wordList[0] ?? "";
  }

  async function init() {
    if (word.wordList.length === 0) {
      await reloadWordList();
    }

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

  const { start: startBlinkTimeout, stop: stopBlinkTimeout } = useTimeoutFn(
    () => {
      caretBlink.value = true;
    },
    500,
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
    stopBlinkTimeout();
  }

  function calculateResults() {
    const correctChars = keystrokeStats.correct;
    const incorrectChars = keystrokeStats.incorrect;
    const wpm = calculateWPM(correctChars, preferences.timeLimit);
    const accuracy = calculateAccuracy(correctChars, incorrectChars);

    Object.assign(results, {
      wpm,
      accuracy,
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

    keystrokeStats.correct = 0;
    keystrokeStats.incorrect = 0;

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
      const currentPosition = word.typedWord.length;
      const expectedChar = word.currWord[currentPosition];

      // Track keystroke accuracy in real-time
      if (char === expectedChar) {
        keystrokeStats.correct++;
      }
      else {
        keystrokeStats.incorrect++;
      }

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

      // Undo keystroke stats for the previous word to prevent double-counting
      const actualWord = word.wordList[word.typedHistory.length] || "";
      for (let i = 0; i < previousWord.length; i++) {
        if (previousWord[i] === actualWord[i]) {
          keystrokeStats.correct--;
        }
        else {
          keystrokeStats.incorrect--;
        }
      }

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

    stopBlinkTimeout();
    caretBlink.value = false;
    startBlinkTimeout();
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
      activeElement.value?.blur();
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
