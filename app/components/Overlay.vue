<script setup lang="ts">
interface Props {
  show?: boolean;
  position?: "fixed" | "absolute";
  blur?: boolean;
  clickable?: boolean;
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  position: "fixed",
  blur: true,
  clickable: true,
  zIndex: 10,
});

const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  if (props.clickable) {
    emit("click");
  }
}
</script>

<template>
  <div
    class="inset-x-0 grid place-items-center bg-overlay transition-opacity duration-200"
    :class="[
      position,
      blur && 'backdrop-blur-lg',
      show ? 'opacity-100' : 'pointer-events-none opacity-0',
      clickable && 'cursor-pointer',
    ]"
    :style="{ zIndex }"
    @click="handleClick"
  >
    <slot />
  </div>
</template>
