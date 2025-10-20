<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";
import { motion } from "motion-v";

const roomCode = ref("");

const modes = ["words", "sentences"] as const;
const selectedMode = ref<TestMode>("words");

async function joinRoom() {}

async function createRoom() {}

useSeoMeta({
  title: `Multiplayer Mode - ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  ogTitle: `Multiplayer Mode - ${SITE_NAME}`,
  ogDescription: SITE_DESCRIPTION,
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 py-16">
    <div class="flex flex-col items-center gap-4">
      <Icon name="lucide:users" class="size-16 text-primary" />
      <h2 class="text-4xl font-bold text-primary">
        multiplayer mode
      </h2>
    </div>

    <div class="flex items-center gap-2">
      <input
        v-model="roomCode"
        type="text"
        placeholder="enter room code"
        class="h-10 min-w-[255px] rounded-l-lg bg-foreground px-4 text-background shadow-b shadow-foreground/50 outline-none placeholder:font-medium placeholder:text-background/75"
        @keyup.enter="joinRoom"
      >
      <button
        class="grid size-10 place-items-center rounded-r-lg bg-primary text-background shadow-b shadow-primary/60 transition-all hover:opacity-90 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed"
        :disabled="!roomCode.trim()"
        @click="joinRoom"
      >
        <Icon name="lucide:arrow-right" class="size-5" />
      </button>
    </div>

    <div class="my-2 text-3xl font-semibold">
      or
    </div>

    <div class="flex items-center gap-3 text-sm tracking-wider">
      <button
        v-for="mode in modes"
        :key="mode"
        class="relative rounded-lg px-4 py-2 font-semibold capitalize transition-colors hover:text-primary"
        :class="selectedMode === mode ? 'text-primary' : 'text-foreground'"
        @click="selectedMode = mode"
      >
        <motion.div
          v-if="selectedMode === mode"
          layout-id="mode-background"
          class="absolute inset-0 -z-10 rounded-lg bg-primary/20"
          :transition="{ type: 'spring', bounce: 0.2, duration: 0.5 }"
        />
        {{ mode }}
      </button>
    </div>

    <button
      class="h-10 rounded-lg bg-primary px-8 font-semibold tracking-wide text-background shadow-b shadow-primary/60 transition-all hover:opacity-90 active:translate-y-1 active:shadow-none"
      @click="createRoom"
    >
      Create New Room
    </button>
  </div>
</template>
