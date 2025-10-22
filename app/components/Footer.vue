<script setup lang="ts">
import { AUTHOR } from "#shared/constants";
import { motion } from "motion-v";

const store = useTypingStore();
</script>

<template>
  <motion.footer
    :animate="{ opacity: store.isTyping ? 0 : 1 }"
    :transition="{ duration: 0.3 }"
    class="relative z-20 flex flex-col gap-6 pb-6"
  >
    <div class="flex items-center justify-center gap-2 text-sm tracking-wider text-muted">
      <kbd class="kbd">Tab</kbd>
      <span>&plus;</span>
      <kbd class="kbd">Enter</kbd>
      <span>&minus;</span>
      <span>restart test</span>
    </div>

    <div class="flex items-center justify-center gap-4 text-sm tracking-wider text-muted">
      <a
        href="https://github.com/sothearo-kay/quickkeys"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 transition-colors hover:text-primary"
      >
        <Icon name="lucide:code-xml" class="size-4" />
        <span>GitHub</span>
      </a>
      <span>&middot;</span>
      <span>created by {{ AUTHOR }}</span>
    </div>
  </motion.footer>
</template>
