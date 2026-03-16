<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";

const props = defineProps<{
  seconds: number;
}>();

const display = computed(() => props.seconds > 0 ? String(props.seconds) : "GO!");
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <p class="text-sm font-medium text-foreground/50">
      Get ready...
    </p>
    <AnimatePresence mode="wait">
      <motion.div
        :key="display"
        :initial="{ scale: 0.5, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :exit="{ scale: 1.5, opacity: 0 }"
        :transition="{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }"
        class="mb-16 font-mono text-8xl font-bold"
        :class="seconds === 0 ? 'text-primary' : 'text-foreground'"
      >
        {{ display }}
      </motion.div>
    </AnimatePresence>
  </div>
</template>
