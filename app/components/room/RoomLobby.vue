<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";

const props = defineProps<{
  room: RoomClientState;
  myId: string;
  isHost: boolean;
}>();

const emit = defineEmits<{
  ready: [];
  updateSettings: [settings: { mode?: string; timeLimit?: number }];
  start: [];
  leave: [];
}>();

const timeLimits = [15, 30, 60, 120];
const modes = ["words", "sentences"] as const;

const myPlayer = computed(() => props.room.players.find((p: Player) => p.id === props.myId));
const canStart = computed(() => {
  const nonHost = props.room.players.filter((p: Player) => p.id !== props.room.host);
  return nonHost.every((p: Player) => p.isReady);
});

const { copied, copy } = useClipboard({ source: props.room.code });
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-6">
    <div class="flex flex-col items-center gap-2">
      <span class="text-[10px] font-bold tracking-[0.18em] text-foreground/50 uppercase">Room Code</span>
      <button
        class="group relative flex items-center gap-4 rounded-2xl border px-10 py-4 transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.03]"
        @click="copy(room.code)"
      >
        <span class="font-mono text-[2.25rem] leading-none font-bold tracking-[0.2em] text-primary">
          {{ room.code }}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            v-if="copied"
            key="check"
            :initial="{ scale: 0.5, opacity: 0 }"
            :animate="{ scale: 1, opacity: 1 }"
            :exit="{ scale: 0.5, opacity: 0 }"
            :transition="{ duration: 0.15 }"
          >
            <Icon name="lucide:check" class="size-4 text-primary" />
          </motion.span>
          <motion.span
            v-else
            key="copy"
            :initial="{ scale: 0.5, opacity: 0 }"
            :animate="{ scale: 1, opacity: 0.3 }"
            :exit="{ scale: 0.5, opacity: 0 }"
            :transition="{ duration: 0.15 }"
            class="transition-opacity group-hover:opacity-60"
          >
            <Icon name="lucide:copy" class="size-4 text-foreground" />
          </motion.span>
        </AnimatePresence>
      </button>
      <p class="text-xs text-foreground/30">
        Click to copy<span class="mx-1.5 inline-block">&middot;</span>share with friends
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold tracking-[0.18em] text-foreground/50 uppercase">Players</span>
        <span class="text-[10px] font-bold tracking-[0.18em] text-foreground/50 uppercase tabular-nums">{{ room.players.length }}</span>
      </div>
      <div class="overflow-hidden rounded-xl border">
        <AnimatePresence>
          <motion.div
            v-for="(player, i) in room.players"
            :key="player.id"
            :initial="{ opacity: 0, x: -8 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 8 }"
            :transition="{ duration: 0.2, delay: i * 0.04 }"
            class="relative flex items-center gap-3 px-4 py-3 not-first:border-t not-first:border-foreground/5"
          >
            <motion.div
              class="absolute top-0 left-0 h-full w-0.5 rounded-r-full"
              :animate="{
                opacity: player.isReady ? 1 : 0,
                scaleY: player.isReady ? 1 : 0.3,
              }"
              :transition="{ duration: 0.25 }"
              :style="{ backgroundColor: 'var(--primary)' }"
            />

            <Avatar :name="player.username" :size="30" />

            <span class="flex-1 text-sm leading-none font-medium">
              {{ player.username }}
            </span>

            <div class="flex items-center gap-2">
              <span
                v-if="player.id === room.host"
                class="rounded-md border border-foreground/20 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-foreground/50 uppercase"
              >
                host
              </span>
              <span
                v-if="player.id === myId"
                class="rounded-md border border-foreground/20 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-foreground/50 uppercase"
              >
                you
              </span>
              <motion.div
                class="flex items-center gap-1.5"
                :animate="{ opacity: player.isReady ? 1 : 0.4 }"
                :transition="{ duration: 0.2 }"
              >
                <div
                  class="size-1.5 rounded-full transition-colors duration-300"
                  :style="{ backgroundColor: player.isReady ? 'var(--primary)' : 'var(--foreground)' }"
                />
                <span class="text-[11px] font-medium transition-colors duration-300" :class="player.isReady ? 'text-primary' : 'text-foreground/50'">
                  {{ player.isReady ? 'ready' : 'waiting' }}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

    <AnimatePresence>
      <motion.div
        v-if="isHost"
        :initial="{ opacity: 0, y: 6 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 6 }"
        :transition="{ duration: 0.2 }"
        class="flex flex-col gap-2"
      >
        <span class="text-[10px] font-bold tracking-[0.18em] text-foreground/50 uppercase">Settings</span>
        <div class="flex flex-col gap-3 rounded-xl border px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-foreground/50">Mode</span>
            <div class="flex items-center gap-0.5 rounded-lg bg-foreground/5 p-0.5">
              <button
                v-for="mode in modes"
                :key="mode"
                class="relative rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors"
                :class="room.mode === mode ? 'text-background' : 'text-foreground/40 hover:text-foreground/70'"
                @click="emit('updateSettings', { mode })"
              >
                <motion.div
                  v-if="room.mode === mode"
                  layout-id="settings-mode-bg"
                  class="absolute inset-0 rounded-md bg-primary"
                  :transition="{ type: 'spring', bounce: 0.15, duration: 0.4 }"
                />
                <span class="relative z-10">{{ mode }}</span>
              </button>
            </div>
          </div>

          <div class="h-px bg-foreground/5" />

          <div class="flex items-center justify-between">
            <span class="text-sm text-foreground/50">Time</span>
            <div class="flex items-center gap-0.5 rounded-lg bg-foreground/5 p-0.5">
              <button
                v-for="t in timeLimits"
                :key="t"
                class="relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                :class="room.timeLimit === t ? 'text-background' : 'text-foreground/40 hover:text-foreground/70'"
                @click="emit('updateSettings', { timeLimit: t })"
              >
                <motion.div
                  v-if="room.timeLimit === t"
                  layout-id="settings-time-bg"
                  class="absolute inset-0 rounded-md bg-primary"
                  :transition="{ type: 'spring', bounce: 0.15, duration: 0.4 }"
                />
                <span class="relative z-10">{{ t }}s</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>

    <div class="flex items-center gap-3">
      <Button variant="secondary" class="flex-1" @click="emit('leave')">
        Leave
      </Button>

      <Button
        v-if="!isHost"
        class="flex-1"
        :class="myPlayer?.isReady ? 'opacity-70' : ''"
        @click="emit('ready')"
      >
        {{ myPlayer?.isReady ? 'Unready' : 'Ready' }}
      </Button>

      <Button
        v-else
        class="flex-1"
        :disabled="!canStart"
        @click="emit('start')"
      >
        Start Game
      </Button>
    </div>
  </div>
</template>
