<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";

const store = useTypingStore();
const keys = useMagicKeys();
const activeElement = useActiveElement();

whenever(keys.tab_enter!, async () => {
  activeElement.value?.blur();
  await store.restart();
});

const url = useRequestURL();

useSeoMeta({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogSiteName: SITE_NAME,
  ogUrl: url.href,
  twitterCard: "summary_large_image",
  twitterTitle: SITE_NAME,
  twitterDescription: SITE_DESCRIPTION,
  ogImage: `${url.origin}/og.png`,
  twitterImage: `${url.origin}/og.png`,
});
</script>

<template>
  <main class="container grid h-dvh grid-rows-[auto_1fr_auto] py-6">
    <AppHeader />
    <TypingResult v-if="store.results.showResults" />
    <TypingTest v-else />
    <AppFooter />
  </main>
</template>
