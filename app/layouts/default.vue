<script setup lang="ts">
const breakpoints = useBreakpoints({
  mobile: 768,
});

const isMobile = breakpoints.smaller("mobile");
const showMobileWarning = useSessionStorage("mobile-warning-dismissed", true);

function dismissWarning() {
  showMobileWarning.value = false;
}
</script>

<template>
  <main class="container grid h-dvh grid-rows-[auto_1fr_auto] pt-6">
    <Teleport to="body">
      <Overlay
        :show="isMobile && showMobileWarning"
        position="fixed"
        :z-index="50"
        :clickable="false"
        class="h-dvh"
      >
        <div class="flex max-w-md flex-col items-center gap-6 text-center">
          <div class="space-y-2">
            <h2 class="text-2xl font-bold">
              Better experience on larger screens
            </h2>
            <p class="text-muted">
              This typing test works best on tablets and desktop devices with a physical keyboard.
            </p>
          </div>
          <Button variant="outline" @click="dismissWarning">
            Dismiss
          </Button>
        </div>
      </Overlay>
    </Teleport>

    <Header />
    <slot />
    <Footer />
  </main>
</template>
