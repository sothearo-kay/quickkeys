<script setup lang="ts">
definePageMeta({ hideShortcuts: true });

const route = useRoute();
const router = useRouter();
const roomCode = computed(() => route.params.code as string);
const { username } = useUser();
const playerId = usePlayerId();
const roomAction = useSessionStorage<"create" | "join" | null>("room-action", null);

const myId = playerId;

const room = ref<RoomClientState | null>(null);
const connectionError = ref("");
const chatMessages = ref<ChatMessage[]>([]);
const liveProgress = ref<Record<string, LiveProgress>>({});

const now = useNow({ interval: 100 });

const myPlayer = computed(() => room.value?.players.find(p => p.id === myId.value));
const isHost = computed(() => room.value?.host === myId.value);
const otherPlayers = computed(() => room.value?.players.filter(p => p.id !== myId.value) ?? []);

const phase = computed(() => {
  if (!room.value)
    return "connecting";
  if (!room.value.started)
    return "lobby";
  if (room.value.startedAt && now.value.getTime() < room.value.startedAt)
    return "countdown";
  if (myPlayer.value?.isFinished)
    return "results";
  return "racing";
});

const isRacing = useRaceMode();
watch(phase, (p) => {
  isRacing.value = p === "racing" || p === "countdown";
}, { immediate: true });

onUnmounted(() => {
  isRacing.value = false;
});

const countdownSeconds = computed(() => {
  if (!room.value?.startedAt)
    return 3;
  return Math.max(0, Math.ceil((room.value.startedAt - now.value.getTime()) / 1000));
});

const { send } = usePartySocket(roomCode, {
  onConnected: () => {
    const name = username.value;
    if (!name)
      return;
    const action = roomAction.value;
    roomAction.value = null; // consume so reload sees null
    if (action === "create") {
      send({ type: "create", data: { username: name, playerId: myId.value } });
    }
    else if (action === "join") {
      send({ type: "join", data: { username: name, playerId: myId.value } });
    }
    else {
      // null = reload — rejoin existing session
      send({ type: "rejoin", data: { username: name, playerId: myId.value } });
    }
  },
  onMessage: (_ws, _event, data) => {
    if (data.type === "sync") {
      room.value = data.room;
      if (!data.room?.started)
        liveProgress.value = {};
    }
    else if (data.type === "progress") {
      liveProgress.value[data.playerId] = data.data;
    }
    else if (data.type === "message") {
      chatMessages.value.push({ userId: data.userId, username: data.from, text: data.data });
    }
    else if (data.type === "error") {
      connectionError.value = data.message;
      setTimeout(() => router.push("/multiplayer"), 1000);
    }
  },
});

onMounted(() => {
  if (!username.value)
    router.push("/multiplayer");
});

function handleReady() {
  send({ type: "ready" });
}

function handleUpdateSettings(settings: { mode?: string; timeLimit?: number }) {
  send({ type: "settings", data: settings });
}

async function handleStart() {
  const wordList = await loadWordList(room.value!.mode);
  send({ type: "start", data: { wordList } });
}

function handleProgress(data: { progress: number; wpm: number; accuracy: number }) {
  send({ type: "progress", data });
}

function handleFinish(results: ResultsState) {
  send({ type: "finish", data: { results } });
}

function handleRestart() {
  send({ type: "restart" });
}

function sendChatMessage(message: string) {
  send({ type: "message", username: username.value ?? "", text: message });
}

function leaveRoom() {
  router.push("/multiplayer");
}
</script>

<template>
  <div class="grid place-items-center py-16">
    <div v-if="phase === 'connecting'" class="flex flex-col items-center gap-3">
      <Icon v-if="!connectionError" name="lucide:loader-circle" class="size-5 animate-spin text-foreground/30" />
      <p class="text-sm font-medium" :class="connectionError ? 'text-red-500' : 'text-foreground/40'">
        {{ connectionError || 'Connecting...' }}
      </p>
    </div>

    <RoomLobby
      v-else-if="phase === 'lobby'"
      :room="room!"
      :my-id="myId"
      :is-host="isHost"
      @ready="handleReady"
      @update-settings="handleUpdateSettings"
      @start="handleStart"
      @leave="leaveRoom"
    />

    <RoomCountdown
      v-else-if="phase === 'countdown'"
      :seconds="countdownSeconds"
    />

    <RoomRace
      v-else-if="phase === 'racing'"
      :word-list="room!.wordList"
      :time-limit="room!.timeLimit"
      :started-at="room!.startedAt!"
      :other-players="otherPlayers"
      :live-progress="liveProgress"
      @progress="handleProgress"
      @finish="handleFinish"
    />

    <RoomResults
      v-else-if="phase === 'results'"
      :players="room!.players"
      :my-id="myId"
      :is-host="isHost"
      @restart="handleRestart"
      @leave="leaveRoom"
    />

    <Teleport to="body">
      <RoomChat
        v-if="room"
        v-model="chatMessages"
        :my-user-id="myId"
        :players="room.players"
        @send="sendChatMessage"
      />
    </Teleport>
  </div>
</template>
