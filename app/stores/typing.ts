export const useTypingStore = defineStore("typing", () => {
  const activeElement = useActiveElement();
  const racing = useRaceTyping();

  const preferences = reactive<PreferencesState>({
    timeLimit: 30,
    mode: "sentences",
  });

  const isTyping = computed(() => racing.hasStarted.value && !racing.results.isFinished);

  async function reloadWordList() {
    const words = await loadWordList(preferences.mode);
    racing.word.wordList = words;
    racing.word.currWord = words[0] ?? "";
  }

  async function init() {
    if (racing.word.wordList.length === 0)
      await reloadWordList();

    racing.init(racing.word.wordList, preferences.timeLimit);
  }

  async function restart() {
    racing.stopTimer();

    if (racing.results.isFinished)
      await reloadWordList();

    racing.init(racing.word.wordList, preferences.timeLimit);
  }

  function handleKeyPress(key: string, ctrlKey = false) {
    // Start timer on first keypress
    if (!racing.hasStarted.value && key.length === 1) {
      racing.startTimer();
      activeElement.value?.blur();
    }

    racing.handleKeyPress(key, ctrlKey);
  }

  return {
    preferences,
    word: racing.word,
    time: racing.time,
    results: racing.results,
    activeWordRef: racing.activeWordRef,
    caretBlink: racing.caretBlink,
    isTyping,
    init,
    restart,
    reloadWordList,
    handleKeyPress,
  };
});
