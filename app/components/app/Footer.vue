<script setup lang="ts">
import { motion } from "motion-v";

const store = useTypingStore();
</script>

<template>
  <motion.footer :animate="{ opacity: store.isTyping ? 0 : 1 }" :transition="{ duration: 0.3 }">
    <div class="mb-16 flex items-center justify-center gap-2 text-sm text-foreground/60">
      <kbd class="kbd">Tab</kbd>
      <span>+</span>
      <kbd class="kbd">Enter</kbd>
      <span>- restart test</span>
    </div>
  </motion.footer>
</template>
