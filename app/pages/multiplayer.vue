<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";
import { motion } from "motion-v";

definePageMeta({
  hideShortcuts: true,
});

const room = reactive({
  code: "",
  error: "",
});

const modes = ["words", "sentences"] as const;
const selectedMode = ref<TestMode>("words");

const { isUserSet, setUsername } = useUser();
const showUserDialog = ref(false);
const router = useRouter();

onMounted(() => {
  if (!isUserSet.value) {
    showUserDialog.value = true;
  }
});

whenever(() => room.code, () => {
  if (room.error) {
    room.error = "";
  }
});

async function joinRoom() {
  const code = room.code.toUpperCase().trim();

  if (!isValidRoomCode(code)) {
    room.error = "Invalid room code";
    return;
  }

  await router.push(`/room/${code}?action=join`);
}

async function createRoom() {
  const code = generateRoomCode();
  await router.push(`/room/${code}?action=create`);
}

function handleUsernameSubmit(name: string) {
  setUsername(name);
}

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

    <div class="relative flex flex-col items-center gap-2">
      <div class="flex items-center gap-2">
        <input
          v-model="room.code"
          type="text"
          placeholder="Enter room code"
          class="h-10 min-w-[255px] rounded-l-lg bg-foreground px-4 text-background shadow-b shadow-foreground/50 outline-none placeholder:font-medium placeholder:text-background/75"
          @keyup.enter="joinRoom"
        >
        <Button
          icon
          class="rounded-l-none"
          :disabled="!room.code.trim()"
          @click="joinRoom"
        >
          <Icon name="lucide:arrow-right" class="size-5" />
        </Button>
      </div>
      <AnimatePresence>
        <motion.div
          v-if="room.error"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0 }"
          class="absolute -bottom-8 left-0 text-sm font-medium text-muted"
        >
          {{ room.error }}
        </motion.div>
      </AnimatePresence>
    </div>

    <div class="mt-4 text-3xl font-semibold">
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

    <Button @click="createRoom">
      Create New Room
    </Button>

    <UserDialog
      v-model="showUserDialog"
      @submit="handleUsernameSubmit"
    />
  </div>
</template>
