/**
 * Returns whether the given word index is active or completed.
 */
function getWordStatus(wordIndex: number, currentIndex: number) {
  return {
    isActive: wordIndex === currentIndex,
    isCompleted: wordIndex < currentIndex,
  };
}

/**
 * Compare a character from typed vs actual word.
 */
function compareChar(typedChar?: string, actualChar?: string): string {
  if (typedChar === undefined)
    return "";
  return typedChar === actualChar ? "right" : "wrong";
}

/**
 * Compute the class of each character depending on typing state.
 */
export function getCharClass(
  wordIndex: number,
  charIndex: number,
  storeWord: WordState,
  currentWordIndex: number,
): string {
  const { isActive, isCompleted } = getWordStatus(wordIndex, currentWordIndex);

  if (isActive) {
    return compareChar(
      storeWord.typedWord[charIndex],
      storeWord.wordList[wordIndex]?.[charIndex],
    );
  }

  if (isCompleted) {
    const typedWord = storeWord.typedHistory[wordIndex] || "";
    const actualWord = storeWord.wordList[wordIndex] || "";
    const typedChar = typedWord[charIndex];
    const actualChar = actualWord[charIndex];

    if (typedChar === undefined)
      return typedWord.length < actualWord.length ? "wrong" : "";

    return compareChar(typedChar, actualChar);
  }

  return "";
}

/**
 * Compute extra letters typed beyond the current word.
 */
export function getExtraLetters({ typedWord, currWord }: WordState): string[] {
  return typedWord.length <= currWord.length
    ? []
    : typedWord.slice(currWord.length).split("");
}

/**
 * Compute the extra characters for a given word index.
 */
export function getExtraChars(
  wordIndex: number,
  currentWordIndex: number,
  storeWord: WordState,
  extraLetters: string[],
): string[] {
  const { isActive, isCompleted } = getWordStatus(wordIndex, currentWordIndex);

  if (isActive)
    return extraLetters;

  if (isCompleted) {
    const typed = storeWord.typedHistory[wordIndex] || "";
    const word = storeWord.wordList[wordIndex] || "";
    return typed.length > word.length
      ? typed.slice(word.length).split("")
      : [];
  }

  return [];
}

/**
 * Check if a word is incorrect.
 */
export function isWordWrong(
  wordIndex: number,
  currentWordIndex: number,
  storeWord: WordState,
  extraLetters: string[],
): boolean {
  const { isActive, isCompleted } = getWordStatus(wordIndex, currentWordIndex);

  if (isActive)
    return extraLetters.length > 0;

  if (isCompleted) {
    const typed = storeWord.typedHistory[wordIndex] || "";
    const word = storeWord.wordList[wordIndex] || "";
    return typed !== word;
  }

  return false;
}

/**
 * Calculate WPM (Words Per Minute).
 * Standard word = 5 characters
 */
export function calculateWPM(correctChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0)
    return 0;

  const timeInMinutes = timeInSeconds / 60;
  return Math.round((correctChars / 5) / timeInMinutes);
}

/**
 * Calculate accuracy percentage.
 */
export function calculateAccuracy(correctChars: number, incorrectChars: number): number {
  const totalChars = correctChars + incorrectChars;
  if (totalChars <= 0)
    return 0;

  return Math.round((correctChars / totalChars) * 100);
}

/**
 * Load word list from JSON file and shuffle.
 */
export async function loadWordList(mode: TestMode): Promise<string[]> {
  try {
    const module = await import(`~/data/wordlists/${mode}.json`);
    const data = module.default as string[];

    if (mode === "sentences") {
      return shuffleArray(data).flatMap(sentence => sentence.split(" "));
    }

    return shuffleArray(data);
  }
  catch (error) {
    console.error(`Failed to load word list for mode "${mode}":`, error);
    return [];
  }
}
