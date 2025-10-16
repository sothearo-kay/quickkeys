<script setup lang="ts">
import { motion } from "motion-v";

const store = useTypingStore();
await callOnce("typing-init", () => store.init());

const currentWordIndex = computed(() => store.word.typedHistory.length);
const extraLetters = computed(() => getExtraLetters(store.word));

const windowFocused = useWindowFocus();
const isMounted = useMounted();

// Only show overlay after user has interacted with the page
// This prevents CLS during initial page load (Lighthouse tests)
const hasInteracted = ref(false);
const { ready, start, stop } = useTimeout(1000, { controls: true, immediate: false });

function markInteraction() {
  hasInteracted.value = true;
}

useEventListener("keydown", markInteraction, { once: true });
useEventListener("click", markInteraction, { once: true });

const isFocused = computed(() => {
  if (!hasInteracted.value)
    return true;
  return windowFocused.value || !ready.value;
});

watch(windowFocused, (focused) => {
  if (!hasInteracted.value)
    return;

  if (focused) {
    stop();
  }
  else {
    start();
  }
});

const stopKeyListener = onKeyStroke(true, handleKeyDown);

watch(() => store.results.isFinished, (finished) => {
  if (finished)
    stopKeyListener();
});

function handleKeyDown(e: KeyboardEvent) {
  if (!isFocused.value)
    return;

  e.preventDefault();
  store.handleKeyPress(e.key, e.ctrlKey);
}

function handleClick() {
  hasInteracted.value = true;
  window.focus();
}

function setActiveWordRef(
  el: Element | ComponentPublicInstance | null,
  idx: number,
) {
  if (idx === currentWordIndex.value) {
    store.activeWordRef = el as HTMLDivElement | null;
  }
}
</script>

<template>
  <div class="relative grid place-items-center">
    <div
      class="fixed inset-0 z-10 grid cursor-pointer place-items-center bg-overlay backdrop-blur-lg transition-opacity duration-200"
      :class="[
        isMounted && !isFocused ? 'opacity-100' : 'pointer-events-none opacity-0',
      ]"
      @click="handleClick"
    >
      <div class="flex flex-col items-center text-foreground-muted">
        <Icon name="lucide:mouse-pointer-click" class="size-8" />
        <p class="mt-2 text-lg font-medium">
          Click here or press any key to focus
        </p>
      </div>
    </div>

    <div class="transform-gpu space-y-1 font-mono transition-all duration-200" :class="{ 'blur-sm': isMounted && !isFocused }">
      <div class="ml-[5px] text-2xl font-bold text-highlight">
        {{ store.time.timer }}
      </div>

      <div class="flex h-[calc(var(--font-size)*1.5*3)] flex-wrap items-center justify-start overflow-hidden text-(length:--font-size) select-none [--font-size:18pt]">
        <div
          v-for="(word, idx) in store.word.wordList"
          :key="`${word}-${idx}`"
          :ref="(el) => setActiveWordRef(el, idx)"
          class="word"
          :class="{
            active: idx === currentWordIndex,
            wrong: isWordWrong(idx, currentWordIndex, store.word, extraLetters),
          }"
        >
          <motion.span
            v-if="idx === currentWordIndex"
            layout-id="caret"
            class="caret"
            :class="{ blink: store.caretBlink }"
            :style="{ left: `${store.word.typedWord.length * 0.6}em` }"
            :transition="{ type: 'tween', duration: 0.15, ease: [0.16, 1, 0.3, 1] }"
          >
            &vert;
          </motion.span>

          <span
            v-for="(char, charIdx) in word.split('')"
            :key="charIdx"
            class="char"
            :class="getCharClass(idx, charIdx, store.word, currentWordIndex)"
          >
            {{ char }}
          </span>

          <span
            v-for="(char, charIdx) in getExtraChars(idx, currentWordIndex, store.word, extraLetters)"
            :key="`extra-${charIdx}`"
            class="char wrong extra"
          >
            {{ char }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.word {
  margin-inline: 5px;
  position: relative;
}

.word.wrong {
  text-decoration: 2px underline var(--highlight);
  animation: shake 0.1s ease;
}

@keyframes shake {
  0% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}

.caret {
  position: absolute;
  left: 0;
  color: var(--highlight);
  margin-left: -0.3em;
}

.caret.blink {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.char {
  color: var(--foreground);
}

.char.right {
  color: var(--primary);
}

.char.wrong {
  color: var(--highlight);
}

.char.extra {
  opacity: 0.6;
}
</style>
