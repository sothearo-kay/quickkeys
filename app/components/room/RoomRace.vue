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

const MAX_VISIBLE = 3;

// Top 3 always shown
const visibleStandings = computed(() => standings.value.slice(0, MAX_VISIBLE));

// Last player always pinned when total > 3
const lastStanding = computed(() => {
  if (standings.value.length <= MAX_VISIBLE)
    return null;
  const last = standings.value[standings.value.length - 1]!;
  return { player: last, rank: standings.value.length };
});

onMounted(() => {
  racing.startTimer();
});
</script>

<template>
  <div class="flex w-full max-w-2xl flex-col gap-4">
    <div class="flex flex-col">
      <template v-for="(player, i) in visibleStandings" :key="player.id">
        <div class="flex items-center gap-2.5 py-1">
          <span
            class="w-3.5 shrink-0 text-right text-xs font-semibold tabular-nums"
            :class="i === 0 ? 'text-primary' : 'text-muted-foreground'"
          >{{ i + 1 }}</span>

          <div
            class="shrink-0 rounded-full transition-all duration-300"
            :class="i === 0 && standings.length > 1 ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background' : ''"
          >
            <Avatar :name="player.username" :size="20" />
          </div>

          <div
            class="flex w-24 shrink-0 items-center gap-0 text-xs font-medium"
            :class="player.isMe ? 'text-foreground' : 'text-muted-foreground'"
          >
            <span class="truncate">{{ player.username }}</span>
            <span v-if="player.isMe" class="shrink-0 font-normal text-muted-foreground"><span class="mx-1.5 inline-block">&middot;</span>you</span>
          </div>

          <div class="flex flex-1 items-center gap-1.5">
            <div class="h-1 flex-1 overflow-hidden rounded-full bg-foreground/8">
              <div
                class="h-full rounded-full transition-[width] duration-300"
                :class="player.isMe ? 'bg-primary' : (i === 0 ? 'bg-primary/50' : 'bg-foreground/20')"
                :style="{ width: `${trackPct(player.progress)}%` }"
              />
            </div>
            <span
              class="w-12 shrink-0 text-right text-xs tabular-nums"
              :class="player.isFinished ? 'font-semibold text-primary' : 'text-muted-foreground'"
            >{{ player.wpm }} wpm</span>
          </div>
        </div>
      </template>

      <template v-if="lastStanding">
        <div v-if="lastStanding.rank - MAX_VISIBLE - 1 > 0" class="my-1 flex items-center gap-1.5 px-6">
          <div class="h-px flex-1 border-t border-dashed border-foreground/10" />
          <span class="text-xs text-foreground/20">{{ lastStanding.rank - MAX_VISIBLE - 1 }} more</span>
          <div class="h-px flex-1 border-t border-dashed border-foreground/10" />
        </div>
        <div class="flex items-center gap-2.5 py-1">
          <span class="w-3.5 shrink-0 text-right text-xs font-semibold text-muted-foreground tabular-nums">
            {{ lastStanding.rank }}
          </span>
          <div class="shrink-0 rounded-full">
            <Avatar :name="lastStanding.player.username" :size="20" />
          </div>
          <div class="flex w-24 shrink-0 items-center text-xs font-medium" :class="lastStanding.player.isMe ? 'text-foreground' : 'text-muted-foreground'">
            <span class="truncate">{{ lastStanding.player.username }}</span>
            <span v-if="lastStanding.player.isMe" class="shrink-0 font-normal text-muted-foreground"><span class="mx-1.5 inline-block">&middot;</span>you</span>
          </div>
          <div class="flex flex-1 items-center gap-1.5">
            <div class="h-1 flex-1 overflow-hidden rounded-full bg-foreground/8">
              <div
                class="h-full rounded-full transition-[width] duration-300"
                :class="lastStanding.player.isMe ? 'bg-primary' : 'bg-foreground/20'"
                :style="{ width: `${trackPct(lastStanding.player.progress)}%` }"
              />
            </div>
            <span class="w-12 shrink-0 text-right text-xs tabular-nums" :class="lastStanding.player.isFinished ? 'font-semibold text-primary' : 'text-muted-foreground'">
              {{ lastStanding.player.wpm }} wpm
            </span>
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
      @key-press="racing.handleKeyPress"
    />
  </div>
</template>
