<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_NAME } from "#shared/constants";

const store = useTypingStore();
const keys = useMagicKeys();

onMounted(() => store.restart());
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
  <div class="grid place-items-center py-16">
    <Transition name="fade" mode="out-in">
      <TypingResult v-if="store.results.showResults" />
      <TypingTest v-else />
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s var(--default-transition-timing-function);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
