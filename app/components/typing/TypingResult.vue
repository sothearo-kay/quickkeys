<script setup lang="ts">
const store = useTypingStore();
</script>

<template>
  <div class="grid place-items-center py-16">
    <div class="space-y-8 text-center">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="text-sm font-medium text-muted">
            WPM
          </div>
          <div class="text-6xl font-bold text-primary">
            {{ store.results.wpm }}
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-sm font-medium text-muted">
            Accuracy
          </div>
          <div class="text-4xl font-bold text-foreground">
            {{ store.results.accuracy }}&percnt;
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="space-y-1">
          <div class="text-muted">
            Correct
          </div>
          <div class="text-lg font-semibold text-primary">
            {{ store.results.correctChars }}
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-muted">
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
