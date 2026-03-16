<script setup lang="ts">
import type { LiveProgress, Player } from "#shared/types/room";

const props = defineProps<{
  wordList: string[];
  timeLimit: number;
  startedAt: number;
  otherPlayers: Player[];
  liveProgress: Record<string, LiveProgress>;
}>();

const emit = defineEmits<{
  progress: [data: { progress: number; wpm: number; accuracy: number }];
  finish: [results: ResultsState];
}>();

const racing = useRaceTyping();
const { username } = useUser();

// Init synchronously so words are ready on first render
const _elapsed = Math.max(0, Math.floor((Date.now() - props.startedAt) / 1000));
racing.init(props.wordList, Math.max(1, props.timeLimit - _elapsed));

const currentWordIndex = computed(() => racing.word.typedHistory.length);

watch(currentWordIndex, (progress) => {
  emit("progress", {
    progress,
    wpm: racing.currentWpm.value,
    accuracy: racing.currentAccuracy.value,
  });
});

watch(() => racing.results.showResults, (show) => {
  if (show)
    emit("finish", { ...racing.results });
});

function getPlayerLiveProgress(player: Player): LiveProgress {
  return props.liveProgress[player.id] ?? { progress: player.progress, wpm: player.wpm, accuracy: player.accuracy };
}

// Unified standings including myself, sorted by words typed
const standings = computed(() => {
  const others = props.otherPlayers.map((p) => {
    const live = getPlayerLiveProgress(p);
    return {
      id: p.id,
      username: p.username,
      progress: live.progress,
      wpm: live.wpm,
      isMe: false,
      isFinished: p.isFinished,
    };
  });

  const me = {
    id: "me",
    username: username.value ?? "",
    progress: currentWordIndex.value,
    wpm: racing.currentWpm.value,
    isMe: true,
    isFinished: racing.results.isFinished,
  };

  return [...others, me].sort((a, b) => b.progress - a.progress);
});

// Scale = max(actual leader progress, expected words at 50 WPM).
// Floor prevents "1 word = 100%" at the start.
// Ceiling expands to fit fast typists so they never get clamped at 100%.
const trackMax = computed(() => {
  const leaderProgress = Math.max(...standings.value.map(p => p.progress), 0);
  const expectedAt50 = Math.round(props.timeLimit * 50 / 60);
  return Math.max(leaderProgress, expectedAt50);
});

function trackPct(progress: number) {
  return Math.min(100, (progress / trackMax.value) * 100);
}

const MAX_VISIBLE = 5;

// Top N players; if I'm outside top N, pin me separately at the bottom
const visibleStandings = computed(() => standings.value.slice(0, MAX_VISIBLE));
const myStanding = computed(() => {
  const myIndex = standings.value.findIndex(p => p.isMe);
  return myIndex >= MAX_VISIBLE ? { player: standings.value[myIndex]!, rank: myIndex + 1 } : null;
});

onMounted(() => {
  racing.startTimer();
});
</script>

<template>
  <div class="flex w-full max-w-2xl flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div
        v-for="(player, i) in visibleStandings"
        :key="player.id"
        class="flex items-center gap-3"
      >
        <span
          class="w-4 shrink-0 text-right text-xs font-semibold tabular-nums"
          :class="i === 0 ? 'text-primary' : 'text-foreground/25'"
        >{{ i + 1 }}</span>

        <div
          class="shrink-0 rounded-full transition-all duration-300"
          :class="i === 0 && standings.length > 1 ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background' : ''"
        >
          <Avatar :name="player.username" :size="24" />
        </div>

        <div class="flex flex-1 flex-col gap-0.5">
          <div class="flex items-baseline justify-between">
            <span
              class="text-xs leading-none font-medium"
              :class="player.isMe ? 'text-foreground' : 'text-foreground/50'"
            >
              {{ player.username }}
              <span v-if="player.isMe" class="ml-1 text-[10px] font-normal text-foreground/30">you</span>
            </span>
            <span class="text-[11px] tabular-nums" :class="player.isFinished ? 'font-semibold text-primary' : 'text-foreground/35'">
              {{ player.wpm }} wpm
            </span>
          </div>
          <div class="h-1 w-full overflow-hidden rounded-full bg-foreground/8">
            <div
              class="h-full rounded-full transition-[width] duration-300"
              :class="player.isMe ? 'bg-primary' : (i === 0 ? 'bg-primary/50' : 'bg-foreground/20')"
              :style="{ width: `${trackPct(player.progress)}%` }"
            />
          </div>
        </div>
      </div>

      <template v-if="myStanding">
        <div class="my-0.5 text-center text-xs text-foreground/20">
          •••
        </div>
        <div class="flex items-center gap-3">
          <span class="w-4 shrink-0 text-right text-xs font-semibold text-foreground/25 tabular-nums">
            {{ myStanding.rank }}
          </span>
          <div class="shrink-0 rounded-full">
            <Avatar :name="myStanding.player.username" :size="24" />
          </div>
          <div class="flex flex-1 flex-col gap-0.5">
            <div class="flex items-baseline justify-between">
              <span class="text-xs leading-none font-medium text-foreground">
                {{ myStanding.player.username }}
                <span class="ml-1 text-[10px] font-normal text-foreground/30">you</span>
              </span>
              <span class="text-[11px] tabular-nums" :class="myStanding.player.isFinished ? 'font-semibold text-primary' : 'text-foreground/35'">
                {{ myStanding.player.wpm }} wpm
              </span>
            </div>
            <div class="h-1 w-full overflow-hidden rounded-full bg-foreground/8">
              <div
                class="h-full rounded-full bg-primary transition-[width] duration-300"
                :style="{ width: `${trackPct(myStanding.player.progress)}%` }"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <TypingArea
      v-model:active-word-ref="racing.activeWordRef.value"
      :word="racing.word"
      :timer="racing.time.timer"
      :caret-blink="racing.caretBlink.value"
      :disabled="racing.results.isFinished"
      caret-layout-id="race-caret"
      @key-press="racing.handleKeyPress"
    />
  </div>
</template>
