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
  });

  const time = reactive<TimeState>({
    timer: 0,
    timerId: null,
  });

  const activeWordRef = ref<HTMLDivElement | null>(null);
  const caretBlink = ref(true);

  let blinkTimeout: ReturnType<typeof setTimeout> | null = null;

  async function loadWordList(type: string): Promise<string[]> {
    try {
      const module = await import(`~/data/wordlists/${type}.json`);
      let data = module.default as string[];

      if (type === "sentences") {
        data = data.flatMap(sentence => sentence.split(" "));
      }

      return data;
    }
    catch (error) {
      console.error(`Failed to load word list for type "${type}":`, error);
      return [];
    }
  }

  async function init() {
    if (word.wordList.length > 0)
      return;

    const words = await loadWordList(preferences.type);
    word.wordList = shuffleArray(words);
    word.currWord = word.wordList[0] ?? "";
    time.timer = preferences.timeLimit;
  }

  function setChar(char: string) {
    word.typedWord += char;
  }

  function removeChar() {
    word.typedWord = word.typedWord.slice(0, -1);
  }

  function appendTypedHistory() {
    word.typedHistory.push(word.typedWord);
    word.typedWord = "";

    const nextIndex = word.typedHistory.length;
    if (nextIndex < word.wordList.length)
      word.currWord = word.wordList[nextIndex] ?? "";
  }

  function handleCaretBlink() {
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
    if (!time.timer)
      return;

    handleCaretBlink();
    scrollActiveWordIntoView();

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
  }

  return {
    preferences,
    word,
    time,
    activeWordRef,
    caretBlink,
    init,
    handleKeyPress,
  };
});
