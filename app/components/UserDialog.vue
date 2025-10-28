<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";

const emit = defineEmits<{
  submit: [username: string];
}>();

const open = defineModel<boolean>({ required: true });
const username = ref("");

function handleSubmit() {
  if (username.value.trim()) {
    emit("submit", username.value.trim());
    open.value = false;
    username.value = "";
  }
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <div
        v-if="open"
        class="fixed inset-0 z-50 grid place-items-center bg-overlay backdrop-blur-sm"
      >
        <motion.div
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          :transition="{ duration: 0.2 }"
          class="flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border-2 border-border bg-background p-8 shadow-xl"
        >
          <div class="flex flex-col items-center gap-2">
            <h2 class="text-2xl font-bold text-primary">
              Welcome!
            </h2>
            <p class="text-center text-muted">
              Before you join — what should we call you?
            </p>
          </div>

          <form
            class="flex w-full items-center gap-2"
            @submit.prevent="handleSubmit"
          >
            <input
              v-model="username"
              type="text"
              placeholder="Your name"
              autofocus
              class="h-10 flex-1 rounded-l-lg bg-foreground px-4 text-background shadow-b shadow-foreground/50 outline-none placeholder:font-medium placeholder:text-background/75"
            >
            <Button
              icon
              type="submit"
              class="rounded-l-none"
              :disabled="!username.trim()"
            >
              <Icon name="lucide:arrow-right" class="size-5" />
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  </Teleport>
</template>
