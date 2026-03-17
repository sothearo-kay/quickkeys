<script setup lang="ts">
import { motion } from "motion-v";

const props = defineProps<{
  players: Player[];
  myId: string;
  isHost: boolean;
}>();

const emit = defineEmits<{
  restart: [];
  leave: [];
}>();

const ranked = computed(() =>
  [...props.players].sort((a, b) => b.wpm - a.wpm),
);

const hoveredIndex = ref<number | null>(null);
</script>

<template>
  <div class="mb-16 flex w-full max-w-lg flex-col gap-6">
    <h2 class="text-3xl font-bold text-primary">
      Results
    </h2>

    <div class="flex flex-col">
      <div
        v-for="(player, i) in ranked"
        :key="player.id"
        class="relative flex cursor-default items-center gap-5 border-b py-4 pr-4 transition-[padding-left,background-color] duration-200 last:border-b-0"
        :class="[
          hoveredIndex === i ? 'pl-6' : 'pl-4',
          i === 0
            ? 'bg-linear-to-r from-primary/10 to-transparent hover:from-primary/15'
            : 'hover:bg-foreground/5',
        ]"
        @mouseenter="hoveredIndex = i"
        @mouseleave="hoveredIndex = null"
      >
        <motion.div
          class="absolute inset-y-0 left-0"
          :class="i === 0 ? 'bg-primary' : 'bg-foreground/25'"
          :animate="{ width: hoveredIndex === i ? 8 : (i === 0 ? 2 : 0) }"
          :transition="{ type: 'spring', stiffness: 500, damping: 35 }"
        />

        <div class="contents">
          <span class="w-5 shrink-0 text-right text-sm font-medium text-foreground/30">
            {{ i + 1 }}
          </span>

          <div class="flex flex-1 items-center gap-3">
            <Avatar :name="player.username" :size="32" />
            <div>
              <div class="leading-tight font-semibold">
                {{ player.username }}
              </div>
              <div class="text-xs text-foreground/40">
                <span v-if="player.id === myId">you<span class="mx-1.5 inline-block">&middot;</span></span>{{ player.accuracy }}% accuracy
              </div>
            </div>
          </div>

          <div class="text-right">
            <div
              class="text-2xl font-bold"
              :class="i === 0 ? 'text-primary' : 'text-foreground'"
            >
              {{ player.wpm }}
            </div>
            <div class="text-xs text-foreground/40">
              wpm
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <Button variant="secondary" class="flex-1" @click="emit('leave')">
        Leave
      </Button>
      <Button v-if="isHost" class="flex-1" @click="emit('restart')">
        Play Again
      </Button>
    </div>
  </div>
</template>
