<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";

const store = useTypingStore();
const keys = useMagicKeys();

whenever(keys.tab_enter!, async () => {
  await store.restart();
});

const url = useRequestURL();

useSeoMeta({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  twitterCard: "summary_large_image",
  ogImage: `${url.origin}/og.png`,
  twitterImage: `${url.origin}/og.png`,
});
</script>

<template>
  <main class="container grid min-h-dvh grid-rows-[auto_1fr_auto]">
    <AppHeader />
    <TypingResult v-if="store.results.showResults" />
    <TypingTest v-else />
    <AppFooter />
  </main>
</template>
