<script setup lang="ts">
const store = useTypingStore();
</script>

<template>
  <div class="grid place-items-center">
    <div class="space-y-8 text-center">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="text-sm font-medium text-foreground/60">
            WPM
          </div>
          <div class="text-6xl font-bold text-primary">
            {{ store.results.wpm }}
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-sm font-medium text-foreground/60">
            Accuracy
          </div>
          <div class="text-4xl font-bold text-foreground">
            {{ store.results.accuracy }}%
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="space-y-1">
          <div class="text-foreground/60">
            Correct
          </div>
          <div class="text-lg font-semibold text-primary">
            {{ store.results.correctChars }}
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-foreground/60">
            Incorrect
          </div>
          <div class="text-lg font-semibold text-highlight">
            {{ store.results.incorrectChars }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
