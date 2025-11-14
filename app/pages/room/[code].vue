<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const roomCode = computed(() => route.params.code as string);
const action = computed(() => route.query.action as string);
const { username, isUserSet } = useUser();

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
}

interface Player {
  id: string;
  username: string;
  joinedAt: number;
}

const messages = ref<string[]>([]);
const chatMessages = ref<ChatMessage[]>([]);
const players = ref<Player[]>([]);
const roomError = ref("");
const myConnectionId = ref("");
const isVerifying = ref(true);
const roomExists = ref(false);

definePageMeta({
  hideShortcuts: true,
});

const { status, send } = usePartySocket(roomCode, {
  onConnected: (_ws) => {
    if (action.value === "create") {
      send({ type: "create" });
    }
  },
  onMessage: (ws, event, data) => {
    if (data.type === "connected") {
      // Store my connection ID
      myConnectionId.value = data.id;

      // When joining, check if room exists
      if (action.value === "join") {
        if (!data.roomExists) {
          roomError.value = "Room does not exist";
          setTimeout(() => router.push("/multiplayer"), 2000);
          return;
        }
        // Room exists, send join message
        send({
          type: "join",
          username: username.value,
        });
      }
    }
    else if (data.type === "room-created") {
      // Room created successfully, now join it
      send({
        type: "join",
        username: username.value,
      });
    }
    else if (data.type === "system") {
      messages.value.push(data.data);
    }
    else if (data.type === "players-update") {
      players.value = data.players;
    }
    else if (data.type === "message") {
      chatMessages.value.push({
        userId: data.userId,
        username: data.from,
        text: data.data,
      });
    }
    else if (data.type === "error") {
      roomError.value = data.message;
      setTimeout(() => router.push("/multiplayer"), 2000);
    }
  },
});

onMounted(() => {
  if (!isUserSet.value) {
    router.push("/multiplayer");
  }
});

function leaveRoom() {
  router.push("/multiplayer");
}

function sendChatMessage(message: string) {
  send({
    type: "message",
    username: username.value,
    text: message,
  });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 py-16">
    <div class="flex flex-col items-center gap-4">
      <Icon name="lucide:users" class="size-16 text-primary" />
      <h2 class="text-4xl font-bold text-primary">
        Room: {{ roomCode }}
      </h2>
      <div class="text-sm text-foreground/75">
        Status: {{ status }}
      </div>
      <div v-if="roomError" class="text-sm font-medium text-red-500">
        {{ roomError }}
      </div>
    </div>

    <div class="flex min-w-96 flex-col gap-2 rounded-lg bg-foreground/10 p-4">
      <div class="text-sm font-semibold text-primary">
        Messages:
      </div>
      <div v-if="messages.length === 0" class="text-sm text-foreground/50">
        No messages yet
      </div>
      <div v-for="(msg, i) in messages" :key="i" class="text-sm text-foreground/75">
        {{ msg }}
      </div>
    </div>

    <Button @click="leaveRoom">
      Leave Room
    </Button>

    <RoomChat
      v-model="chatMessages"
      :my-user-id="myConnectionId"
      :players="players"
      @send="sendChatMessage"
    />
  </div>
</template>
