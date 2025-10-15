<script setup lang="ts">
import { motion } from "motion-v";

const store = useTypingStore();
</script>

<template>
  <motion.footer
    :animate="{ opacity: store.isTyping ? 0 : 1 }"
    :transition="{ duration: 0.3 }"
    class="relative z-20"
  >
    <div class="mb-16 flex items-center justify-center gap-2 text-sm text-muted">
      <kbd class="kbd">Tab</kbd>
      <span>&plus;</span>
      <kbd class="kbd">Enter</kbd>
      <span>&minus;</span>
      <span>restart test</span>
    </div>
  </motion.footer>
</template>
