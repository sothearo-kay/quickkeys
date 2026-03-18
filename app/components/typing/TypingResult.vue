<script setup lang="ts">
const store = useTypingStore();
</script>

<template>
  <div class="mb-16 w-full max-w-2xl">
    <div class="mb-4 flex items-end gap-6">
      <div class="flex flex-col gap-0.5">
        <span class="text-xs font-medium tracking-widest text-muted-foreground uppercase">wpm</span>
        <span class="text-7xl leading-none font-bold text-primary tabular-nums">{{ store.results.wpm }}</span>
      </div>

      <div class="flex flex-col gap-0.5 pb-1">
        <span class="text-xs font-medium tracking-widest text-muted-foreground uppercase">acc</span>
        <span class="text-4xl leading-none font-bold text-foreground tabular-nums">
          {{ store.results.accuracy }}<span class="text-xl font-normal text-muted-foreground">%</span>
        </span>
      </div>

      <div class="ml-auto flex gap-5 pb-1 text-right">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-medium tracking-widest text-muted-foreground uppercase">correct</span>
          <span class="text-xl leading-none font-semibold text-primary tabular-nums">{{ store.results.correctChars }}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-medium tracking-widest text-muted-foreground uppercase">incorrect</span>
          <span class="text-xl leading-none font-semibold text-highlight tabular-nums">{{ store.results.incorrectChars }}</span>
        </div>
      </div>
    </div>

    <TypingWpmChart v-if="store.results.wpmHistory.length > 0" :data="store.results.wpmHistory" />

    <div class="mt-6">
      <Button class="inline-flex items-center gap-2" @click="store.restart">
        <Icon name="lucide:rotate-ccw" class="size-4" />
        Restart
      </Button>
    </div>
  </div>
</template>
