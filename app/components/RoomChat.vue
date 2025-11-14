<script setup lang="ts">
import { motion } from "motion-v";

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

interface Props {
  myUserId: string;
  players: Player[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  send: [message: string];
}>();

const latestPlayers = computed(() => {
  return [...props.players]
    .sort((a, b) => b.joinedAt - a.joinedAt)
    .slice(0, 5);
});

const messages = defineModel<ChatMessage[]>({ default: [] });
const message = ref("");
const messagesContainer = ref<HTMLDivElement | null>(null);

whenever(() => messages.value.length, () => {
  nextTick(() => scrollToBottom());
});

function sendMessage() {
  if (message.value.trim()) {
    emit("send", message.value.trim());
    message.value = "";
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    const lastMessage = messagesContainer.value.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: "smooth",
        inline: "end",
      });
    }
  }
}

function isOwnMessage(msg: ChatMessage) {
  return msg.userId === props.myUserId;
}
</script>

<template>
  <div class="fixed right-6 bottom-6 z-30 flex h-[440px] w-[320px] flex-col rounded-xl border bg-background shadow-xs">
    <div class="flex items-center justify-between p-3">
      <div class="flex items-center gap-2.5">
        <div class="h-2.5 w-2.5 rounded-full bg-primary" />
        <h3 class="text-sm font-medium text-foreground">
          Chat Messages
        </h3>
      </div>
      <div class="flex -space-x-2">
        <AnimatePresence>
          <motion.div
            v-for="player in latestPlayers"
            :key="player.id"
            :initial="{ x: -20, scale: 0, opacity: 0 }"
            :animate="{ x: 0, scale: 1, opacity: 1 }"
            :exit="{ x: 20, scale: 0, opacity: 0 }"
            :transition="{ duration: 0.15 }"
          >
            <Avatar :name="`${player.username}-${player.id}`" :size="24" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

    <div ref="messagesContainer" class="scrollbar-custom flex-1 overflow-y-auto px-3 py-2">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex items-end gap-2 not-last:mb-2"
        :class="isOwnMessage(msg) ? 'justify-end' : 'justify-start'"
      >
        <Avatar v-if="!isOwnMessage(msg)" :name="msg.username" :size="28" />
        <div class="flex flex-col gap-0.5" :class="isOwnMessage(msg) ? 'items-end' : 'items-start'">
          <span v-if="!isOwnMessage(msg)" class="px-2 text-xs text-foreground/50">{{ msg.username }}</span>
          <div
            class="max-w-[220px] rounded-full px-3 py-2 text-sm break-words"
            :class="isOwnMessage(msg) ? 'bg-primary text-background' : 'bg-foreground/10 text-foreground'"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>
    </div>

    <div class="p-3">
      <div class="relative flex items-center">
        <input
          v-model="message"
          type="text"
          placeholder="Aa"
          class="w-full rounded-full bg-foreground/5 px-4 py-2.5 pr-10 text-sm outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-primary/90"
          @keyup.enter="sendMessage"
        >
        <AnimatePresence>
          <motion.button
            v-if="message.trim()"
            :initial="{ scale: 0 }"
            :animate="{ scale: 1 }"
            :exit="{ scale: 0 }"
            class="absolute right-3 flex origin-right items-center justify-center text-primary"
            @click="sendMessage"
          >
            <Icon name="lucide:send" class="size-5" />
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
