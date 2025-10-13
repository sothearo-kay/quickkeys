<script setup lang="ts">
import { motion } from "motion-v";

const store = useTypingStore();
await callOnce("typing-init", () => store.init());

const currentWordIndex = computed(() => store.word.typedHistory.length);
const extraLetters = computed(() => getExtraLetters(store.word));

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

function handleKeyDown(e: KeyboardEvent) {
  e.preventDefault();
  store.handleKeyPress(e.key, e.ctrlKey);
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
  <div class="grid place-items-center">
    <div class="space-y-2 font-mono">
      <div class="ml-2 text-2xl font-bold text-highlight">
        {{ store.time.timer }}
      </div>

      <div class="flex h-[108px] flex-wrap items-center justify-start overflow-hidden text-[18pt] select-none">
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
            |
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
  margin-inline: 0.325rem;
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
