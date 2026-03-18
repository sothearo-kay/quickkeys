<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";

const props = defineProps<{
  myUserId: string;
  players: Player[];
}>();

const emit = defineEmits<{
  send: [message: string];
}>();

const messages = defineModel<ChatMessage[]>({ default: [] });
const message = ref("");
const messagesContainer = ref<HTMLDivElement | null>(null);
const messageInput = ref<HTMLInputElement | null>(null);
const isMinimized = ref(true);
const isRacing = useRaceMode();

// Show last 5 players as avatars in header
const latestPlayers = computed(() => props.players.slice(-5));

watch(() => messages.value.length, () => {
  if (!isMinimized.value) {
    nextTick(() => scrollToBottom());
  }
});

watch(isMinimized, (minimized) => {
  if (!minimized) {
    nextTick(() => {
      scrollToBottom();
      messageInput.value?.focus();
    });
  }
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
      lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }
}

function isOwnMessage(msg: ChatMessage) {
  return msg.userId === props.myUserId;
}
</script>

<template>
  <motion.div
    :animate="{ opacity: isRacing ? 0 : 1 }"
    :transition="{ duration: 0.3 }"
    :style="{ pointerEvents: isRacing ? 'none' : 'auto' }"
    class="fixed right-6 bottom-6 z-30 flex w-[320px] flex-col rounded-xl border bg-background shadow-xs"
  >
    <button
      class="flex w-full items-center justify-between p-3 text-left"
      @click="isMinimized = !isMinimized"
    >
      <div class="flex items-center gap-2.5">
        <div class="h-2.5 w-2.5 rounded-full bg-primary" />
        <h3 class="text-sm font-medium text-foreground">
          Chat Messages
        </h3>
      </div>
      <div class="flex items-center gap-2">
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
              <Avatar :name="player.username" :size="24" />
            </motion.div>
          </AnimatePresence>
        </div>
        <Icon
          :name="isMinimized ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          class="size-4 text-foreground/40 transition-transform"
        />
      </div>
    </button>

    <AnimatePresence :initial="false">
      <motion.div
        v-if="!isMinimized"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }"
        class="overflow-hidden"
      >
        <div ref="messagesContainer" class="h-[280px] scrollbar-custom overflow-y-auto px-3 py-2">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="flex items-end gap-2 not-last:mb-2"
            :class="isOwnMessage(msg) ? 'justify-end' : 'justify-start'"
          >
            <Avatar v-if="!isOwnMessage(msg)" :name="msg.username" :size="28" />
            <div class="flex flex-col gap-0.5" :class="isOwnMessage(msg) ? 'items-end' : 'items-start'">
              <span v-if="!isOwnMessage(msg)" class="px-2 text-xs text-muted-foreground">{{ msg.username }}</span>
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
              ref="messageInput"
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
      </motion.div>
    </AnimatePresence>
  </motion.div>
</template>
