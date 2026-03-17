<script setup lang="ts">
import type { Player } from "#shared/types/room";
import { motion, useMotionValue, useSpring } from "motion-v";

const props = defineProps<{
  player: Player | null;
}>();

const mouseX = useMotionValue(-999);
const mouseY = useMotionValue(-999);

const x = useSpring(mouseX, { damping: 28, stiffness: 220 });
const y = useSpring(mouseY, { damping: 28, stiffness: 220 });

let warmedUp = false;
useEventListener("mousemove", (e: MouseEvent) => {
  const cx = e.clientX + 18;
  const cy = e.clientY + 18;
  if (!warmedUp) {
    warmedUp = true;
    x.jump(cx);
    y.jump(cy);
  }
  mouseX.set(cx);
  mouseY.set(cy);
});

const stats = computed(() => {
  const p = props.player;
  if (!p)
    return [];
  return [
    { label: "wpm", value: p.wpm, suffix: "", valueClass: "text-2xl font-bold text-primary", pad: "py-2.5" },
    { label: "acc", value: p.accuracy, suffix: "%", valueClass: "text-2xl font-bold text-foreground", pad: "py-2.5" },
    { label: "correct", value: p.results?.correctChars ?? "—", suffix: "", valueClass: "text-base font-semibold text-primary", pad: "py-2" },
    { label: "incorrect", value: p.results?.incorrectChars ?? "—", suffix: "", valueClass: "text-base font-semibold text-highlight", pad: "py-2" },
  ];
});
</script>

<template>
  <Teleport to="body">
    <motion.div
      v-if="player"
      key="hover-card"
      class="pointer-events-none fixed top-0 left-0 z-[9999] w-56"
      :style="{ x, y }"
    >
      <div class="overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div class="flex items-center gap-3 px-4 pt-4 pb-3">
          <Avatar :name="player.username" :size="36" />
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-sm leading-tight font-semibold">{{ player.username }}</span>
            <span class="text-xs tracking-widest text-muted-foreground uppercase">
              {{ player.isFinished ? 'finished' : 'racing' }}
            </span>
          </div>
        </div>

        <div class="mx-4 h-px bg-border" />

        <div class="mx-4 mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-background px-3"
            :class="stat.pad"
          >
            <div class="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {{ stat.label }}
            </div>
            <div class="leading-tight tabular-nums" :class="stat.valueClass">
              {{ stat.value }}<span v-if="stat.suffix" class="text-sm font-normal text-muted-foreground">{{ stat.suffix }}</span>
            </div>
          </div>
        </div>

        <div v-if="player.results?.wpmHistory?.length" class="mx-4 my-3">
          <TypingWpmChart :data="player.results.wpmHistory" :show-labels="false" class="h-20!" />
        </div>
      </div>
    </motion.div>
  </Teleport>
</template>
