<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";

type TooltipSide = "top" | "bottom" | "left" | "right";

interface Props {
  text: string;
  side?: TooltipSide;
}

withDefaults(defineProps<Props>(), {
  side: "top",
});

const isHovered = ref(false);
</script>

<template>
  <div
    class="relative inline-block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <slot />

    <AnimatePresence>
      <motion.div
        v-if="isHovered"
        :initial="{ opacity: 0, scale: 0.85 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.85 }"
        :transition="{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }"
        class="tooltip"
        :class="side"
      >
        {{ text }}
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.tooltip {
  --offset: 0.75rem;
  --arrow-size: 4px;
  --translate-y: 0 -50%;
  --translate-x: -50% 0;

  position: absolute;
  background: var(--color-foreground);
  color: var(--color-background);
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 50;
  translate: var(--tooltip-translate);
  transform-origin: var(--tooltip-origin);

  &::after {
    content: "";
    position: absolute;
    border: var(--arrow-size) solid transparent;
    translate: var(--arrow-translate);
    border-color: var(--arrow-border);
  }

  &.left {
    --tooltip-translate: var(--translate-y);
    --tooltip-origin: right center;
    --arrow-translate: var(--translate-y);
    --arrow-border: transparent transparent transparent var(--color-foreground);

    top: 50%;
    right: calc(100% + var(--offset));

    &::after {
      top: 50%;
      left: 100%;
    }
  }

  &.right {
    --tooltip-translate: var(--translate-y);
    --tooltip-origin: left center;
    --arrow-translate: var(--translate-y);
    --arrow-border: transparent var(--color-foreground) transparent transparent;

    top: 50%;
    left: calc(100% + var(--offset));

    &::after {
      top: 50%;
      right: 100%;
    }
  }

  &.top {
    --tooltip-translate: var(--translate-x);
    --tooltip-origin: center bottom;
    --arrow-translate: var(--translate-x);
    --arrow-border: var(--color-foreground) transparent transparent transparent;

    bottom: calc(100% + var(--offset));
    left: 50%;

    &::after {
      top: 100%;
      left: 50%;
    }
  }

  &.bottom {
    --tooltip-translate: var(--translate-x);
    --tooltip-origin: center top;
    --arrow-translate: var(--translate-x);
    --arrow-border: transparent transparent var(--color-foreground) transparent;

    top: calc(100% + var(--offset));
    left: 50%;

    &::after {
      bottom: 100%;
      left: 50%;
    }
  }
}
</style>
