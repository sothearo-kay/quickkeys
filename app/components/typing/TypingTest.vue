<script setup lang="ts">
const store = useTypingStore();
await callOnce("typing-init", () => store.init());
</script>

<template>
  <div class="relative grid size-full place-items-center">
    <TypingArea
      v-model:active-word-ref="store.activeWordRef"
      :word="store.word"
      :timer="store.time.timer"
      :caret-blink="store.caretBlink"
      :disabled="store.results.isFinished"
      @key-press="store.handleKeyPress"
    />
  </div>
</template>
