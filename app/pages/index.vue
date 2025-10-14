<script setup lang="ts">
const store = useTypingStore();
const keys = useMagicKeys();

whenever(keys.tab_enter!, async () => {
  await store.restart();
});
</script>

<template>
  <main class="container grid min-h-screen grid-rows-[max-content_1fr_max-content]">
    <AppHeader />
    <TypingResult v-if="store.results.showResults" />
    <TypingTest v-else />
    <AppFooter />
  </main>
</template>
