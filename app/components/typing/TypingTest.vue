<script setup lang="ts">
import sentencesData from "~/data/wordlists/sentences.json";

const store = useTypingStore();

onMounted(() => {
  const words = sentencesData.flatMap(sentence => sentence.split(" "));
  store.word.wordList = words;

  if (words.length > 0) {
    store.word.currWord = words[0];
  }

  store.time.timer = store.preferences.timeLimit;
});
</script>

<template>
  <div class="grid place-items-center">
    <div class="space-y-2 font-mono">
      <div class="text-2xl font-bold text-primary">
        {{ store.time.timer }}
      </div>

      <div class="flex h-[108px] flex-wrap items-center justify-start overflow-hidden text-[18pt] select-none *:mr-3">
        <div
          v-for="(word, idx) in store.word.wordList"
          :key="`${word}-${idx}`"
        >
          {{ word }}
        </div>
      </div>
    </div>
  </div>
</template>
