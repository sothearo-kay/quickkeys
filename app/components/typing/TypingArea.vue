<script setup lang="ts">
const props = defineProps<{
  word: WordState;
  timer: number;
  caretBlink: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  keyPress: [key: string, ctrlKey: boolean];
}>();

const activeWordRef = defineModel<HTMLDivElement | null>("activeWordRef", { default: null });

const isMounted = useMounted();
const windowFocused = useWindowFocus();
const hasInteracted = ref(false);

const { ready, start: startTimeout, stop: stopTimeout } = useTimeout(1000, { controls: true, immediate: false });

useEventListener("keydown", () => {
  hasInteracted.value = true;
}, { once: true });

useEventListener("click", () => {
  hasInteracted.value = true;
}, { once: true });

const isFocused = computed(() => {
  if (!hasInteracted.value)
    return true;
  return windowFocused.value || !ready.value;
});

watch(windowFocused, (focused) => {
  if (!hasInteracted.value)
    return;
  if (focused)
    stopTimeout();
  else startTimeout();
});

onKeyStroke(true, (e: KeyboardEvent) => {
  if (props.disabled || !isFocused.value)
    return;
  if ((e.ctrlKey || e.altKey || e.metaKey) && e.key !== "Backspace")
    return;
  e.preventDefault();
  emit("keyPress", e.key, e.ctrlKey);
});

const currentWordIndex = computed(() => props.word.typedHistory.length);
const extraLetters = computed(() => getExtraLetters(props.word));

// Persistent caret positioned via offsetTop/offsetLeft + CSS 1ch units.
// Avoids layoutId (crashes motion-v during Nuxt navigation) while keeping
// the cross-word slide animation via CSS transitions.
const caretStyle = ref<{ top: string; left: string } | null>(null);

watchEffect(() => {
  const el = activeWordRef.value;
  if (!el)
    return;
  const typedLen = props.word.typedWord.length;
  caretStyle.value = {
    top: `${el.offsetTop}px`,
    left: `calc(${el.offsetLeft}px + ${typedLen} * 1ch)`,
  };
}, { flush: "post" });

function setActiveWordRef(el: Element | ComponentPublicInstance | null, idx: number) {
  if (idx === currentWordIndex.value) {
    activeWordRef.value = el as HTMLDivElement | null;
  }
}

function handleFocusClick() {
  hasInteracted.value = true;
  window.focus();
}
</script>

<template>
  <Overlay
    position="fixed"
    :show="isMounted && !isFocused"
    @click="handleFocusClick"
  >
    <div class="flex flex-col items-center text-foreground-muted">
      <Icon name="lucide:mouse-pointer-click" class="size-8" />
      <p class="mt-2 text-lg font-medium">
        Click here or press any key to focus
      </p>
    </div>
  </Overlay>

  <div
    class="mb-16 space-y-2 font-mono transition-all duration-200"
    :class="{ 'blur-sm': isMounted && !isFocused }"
  >
    <div class="ml-[5px] inline-block min-w-[4ch] text-2xl font-bold text-highlight tabular-nums">
      {{ timer }}
    </div>

    <div class="relative flex h-[calc(var(--font-size)*var(--line-height)*var(--lines))] flex-wrap items-center justify-start overflow-hidden text-(length:--font-size) leading-(--line-height) select-none [--font-size:18pt] [--line-height:1.7] [--lines:3]">
      <div
        v-for="(w, idx) in word.wordList"
        :key="`${w}-${idx}`"
        :ref="(el) => setActiveWordRef(el, idx)"
        class="word"
        :class="{
          active: idx === currentWordIndex,
          wrong: isWordWrong(idx, currentWordIndex, word, extraLetters),
        }"
      >
        <span
          v-for="(char, charIdx) in w.split('')"
          :key="charIdx"
          class="char"
          :class="getCharClass(idx, charIdx, word, currentWordIndex)"
        >
          {{ char }}
        </span>

        <span
          v-for="(char, charIdx) in getExtraChars(idx, currentWordIndex, word, extraLetters)"
          :key="`extra-${charIdx}`"
          class="char wrong extra"
        >
          {{ char }}
        </span>
      </div>

      <span
        v-if="caretStyle"
        class="caret"
        :class="{ blink: caretBlink }"
        :style="caretStyle"
      >
        &vert;
      </span>
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
  color: var(--highlight);
  margin-left: -0.5ch;
  pointer-events: none;
  user-select: none;
  transition:
    top 0.15s cubic-bezier(0.16, 1, 0.3, 1),
    left 0.15s cubic-bezier(0.16, 1, 0.3, 1);
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
