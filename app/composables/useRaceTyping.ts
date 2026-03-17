export function useRaceTyping() {
  let _timeLimit = 0;

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
    wpmHistory: [],
  });

  const keystrokeStats = {
    correct: 0,
    incorrect: 0,
  };

  const activeWordRef = ref<HTMLDivElement | null>(null);
  const caretBlink = ref(true);
  const hasStarted = ref(false);

  const currentWpm = computed(() => {
    const elapsed = _timeLimit - time.timer;
    if (elapsed <= 0)
      return 0;
    return calculateWPM(keystrokeStats.correct, elapsed);
  });

  const currentAccuracy = computed(() =>
    calculateAccuracy(keystrokeStats.correct, keystrokeStats.incorrect),
  );

  function init(wordList: string[], timeLimit: number) {
    _timeLimit = timeLimit;
    time.timer = timeLimit;
    word.wordList = wordList;
    word.currWord = wordList[0] ?? "";
    word.typedWord = "";
    word.typedHistory = [];
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
      wpmHistory: [],
    });
  }

  const { pause: pauseTimer, resume: resumeTimer, isActive } = useIntervalFn(
    () => {
      time.timer--;
      results.wpmHistory.push(currentWpm.value);
      if (time.timer <= 0) {
        pauseTimer();
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
    const elapsed = _timeLimit - time.timer;
    const correctChars = keystrokeStats.correct;
    const incorrectChars = keystrokeStats.incorrect;
    const wpm = calculateWPM(correctChars, elapsed > 0 ? elapsed : _timeLimit);
    const accuracy = calculateAccuracy(correctChars, incorrectChars);

    Object.assign(results, {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      isFinished: true,
    });
  }

  function setChar(char: string) {
    const maxLength = word.currWord.length + 20;
    if (word.typedWord.length < maxLength) {
      const currentPosition = word.typedWord.length;
      const expectedChar = word.currWord[currentPosition];

      if (char === expectedChar)
        keystrokeStats.correct++;
      else
        keystrokeStats.incorrect++;

      word.typedWord += char;
    }
  }

  function removeChar() {
    if (word.typedWord.length > 0) {
      word.typedWord = word.typedWord.slice(0, -1);
    }
    else if (word.typedHistory.length > 0) {
      const previousWord = word.typedHistory.pop() ?? "";
      const actualWord = word.wordList[word.typedHistory.length] ?? "";

      for (let i = 0; i < previousWord.length; i++) {
        if (previousWord[i] === actualWord[i])
          keystrokeStats.correct--;
        else
          keystrokeStats.incorrect--;
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
    word,
    time,
    results,
    activeWordRef,
    caretBlink,
    hasStarted,
    currentWpm,
    currentAccuracy,
    init,
    startTimer,
    stopTimer,
    handleKeyPress,
  };
}
