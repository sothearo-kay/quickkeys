<script setup lang="ts">
import { SITE_NAME } from "#shared/constants";
import { AnimatePresence, motion } from "motion-v";

const store = useTypingStore();
const colorMode = useColorMode();

const options = {
  times: [15, 30, 60, 120],
  themes: [
    "default",
    "dark",
    "serika",
    "vscode",
    "nord",
    "dracula",
    "monokai",
    "ocean",
    "forest",
    "sunset",
  ],
  modes: ["words", "sentences"],
} as const;

const isTransitioning = ref(false);
const transitionTheme = ref("");
const clickPosition = ref({ x: 0, y: 0 });

const endRadius = computed(() => {
  const { x, y } = clickPosition.value;
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
});

function getOptionClass(isActive: boolean) {
  return isActive ? "text-primary" : "text-muted";
}

function setTimeLimit(time: number) {
  store.preferences.timeLimit = time;
  store.time.timer = time;
}

async function setTheme(theme: string, event: MouseEvent) {
  if (theme === colorMode.preference || isTransitioning.value)
    return;

  clickPosition.value = { x: event.clientX, y: event.clientY };
  transitionTheme.value = theme;
  isTransitioning.value = true;

  await new Promise(resolve => setTimeout(resolve, 600));

  colorMode.preference = theme;
  isTransitioning.value = false;
}

async function setMode(mode: TestMode) {
  store.preferences.mode = mode;
  await store.reloadWordList();
  store.restart();
}
</script>

<template>
  <motion.header
    :animate="{ opacity: store.isTyping ? 0 : 1 }"
    :transition="{ duration: 0.3 }"
    class="relative z-20 flex flex-col gap-2 pt-6"
  >
    <div class="flex items-center justify-between gap-6">
      <div class="text-2xl font-bold text-primary">
        {{ SITE_NAME }}
      </div>

      <div class="flex items-center gap-4 text-sm tracking-wide">
        <div class="flex items-center gap-2">
          <button
            v-for="mode in options.modes"
            :key="mode"
            class="font-medium capitalize transition-colors hover:text-primary"
            :class="getOptionClass(store.preferences.mode === mode)"
            @click="setMode(mode)"
          >
            {{ mode }}
          </button>
        </div>

        <div class="h-4 w-px bg-border" aria-hidden="true" />

        <div class="flex items-center gap-2.5">
          <button
            v-for="time in options.times"
            :key="time"
            class="font-medium transition-colors hover:text-primary"
            :class="getOptionClass(store.preferences.timeLimit === time)"
            @click="setTimeLimit(time)"
          >
            {{ time }}
          </button>
        </div>
      </div>
    </div>

    <div class="ml-50 flex justify-end">
      <div class="flex flex-wrap items-center justify-end gap-2 text-sm tracking-wide">
        <button
          v-for="theme in options.themes"
          :key="theme"
          class="font-medium capitalize transition-colors hover:text-primary"
          :class="getOptionClass(colorMode.preference === theme)"
          @click="setTheme(theme, $event)"
        >
          {{ theme }}
        </button>
      </div>
    </div>
  </motion.header>

  <AnimatePresence>
    <motion.div
      v-if="isTransitioning"
      key="theme-transition"
      class="pointer-events-none fixed inset-0 z-50"
      :class="transitionTheme"
      :initial="{
        clipPath: `circle(0px at ${clickPosition.x}px ${clickPosition.y}px)`,
      }"
      :animate="{
        clipPath: `circle(${endRadius}px at ${clickPosition.x}px ${clickPosition.y}px)`,
      }"
      :transition="{ type: 'tween', duration: 0.6, ease: 'easeInOut' }"
    >
      <div class="h-full w-full bg-background" />
    </motion.div>
  </AnimatePresence>
</template>
