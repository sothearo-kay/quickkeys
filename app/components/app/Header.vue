<script setup lang="ts">
import { motion } from "motion-v";

const store = useTypingStore();

const options = {
  time: [30, 60, 120],
  theme: [
    "default",
    "serika",
    "nord",
    "dracula",
    "monokai",
    "gruvbox",
    "light",
    "dark",
    "ocean",
    "forest",
    "sunset",
  ],
};

function setTimeLimit(time: number) {
  store.preferences.timeLimit = time;
  store.time.timer = time;
}
</script>

<template>
  <motion.header
    :animate="{ opacity: store.isTyping ? 0 : 1 }"
    :transition="{ duration: 0.3 }"
    class="flex items-center justify-between gap-6 pt-6"
  >
    <div class="text-xl font-bold text-primary">
      quickkeys
    </div>

    <div class="flex items-center gap-3">
      <button
        v-for="time in options.time"
        :key="time"
        :class="{ 'text-primary': store.preferences.timeLimit === time, 'text-foreground/60': store.preferences.timeLimit !== time }"
        class="transition-colors hover:text-primary"
        @click="setTimeLimit(time)"
      >
        {{ time }}
      </button>
    </div>
  </motion.header>
</template>
