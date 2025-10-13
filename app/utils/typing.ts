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
