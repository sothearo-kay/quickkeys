<script setup lang="ts">
interface Props {
  name: string;
  size?: number;
  colors?: string[];
  square?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  colors: () => ["#5B8FE5", "#F39C6B", "#A78BFA", "#60A5FA", "#FB923C"],
  square: false,
});

function hashCode(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const character = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getUnit(number: number, range: number, index?: number) {
  const value = number % range;
  if (index && getDigit(number, index) % 2 === 0) {
    return -value;
  }
  return value;
}

function getDigit(number: number, ntn: number) {
  return Math.floor((number / (10 ** ntn)) % 10);
}

function getBoolean(number: number, ntn: number) {
  return !(getDigit(number, ntn) % 2);
}

function getContrast(hexcolor: string) {
  if (hexcolor.slice(0, 1) === "#") {
    hexcolor = hexcolor.slice(1);
  }
  const r = Number.parseInt(hexcolor.slice(0, 2), 16);
  const g = Number.parseInt(hexcolor.slice(2, 4), 16);
  const b = Number.parseInt(hexcolor.slice(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? "#000000" : "#FFFFFF";
}

const data = computed(() => {
  const numFromName = hashCode(props.name);
  const range = props.colors.length;
  const wrapperColor = props.colors[numFromName % range]!;
  const preTranslateX = getUnit(numFromName, 10, 1);
  const wrapperTranslateX = preTranslateX < 5 ? preTranslateX + 36 / 9 : preTranslateX;
  const preTranslateY = getUnit(numFromName, 10, 2);
  const wrapperTranslateY = preTranslateY < 5 ? preTranslateY + 36 / 9 : preTranslateY;
  return {
    wrapperColor,
    faceColor: getContrast(wrapperColor),
    backgroundColor: props.colors[(numFromName + 13) % range]!,
    wrapperTranslateX,
    wrapperTranslateY,
    wrapperRotate: getUnit(numFromName, 360),
    wrapperScale: 1 + getUnit(numFromName, 36) / 100,
    isMouthOpen: getBoolean(numFromName, 2),
    isCircle: getBoolean(numFromName, 1),
    eyeSpread: getUnit(numFromName, 5),
    mouthSpread: getUnit(numFromName, 3),
    faceRotate: getUnit(numFromName, 10, 3),
    faceTranslateX: wrapperTranslateX > 36 / 6 ? wrapperTranslateX / 2 : getUnit(numFromName, 8, 1),
    faceTranslateY: wrapperTranslateY > 36 / 6 ? wrapperTranslateY / 2 : getUnit(numFromName, 7, 2),
  };
});

const maskId = computed(() => `mask-beam-${props.name.replace(/\s+/g, "-")}`);
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 36 36"
    fill="none"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask :id="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
      <rect x="0" y="0" width="36" height="36" :rx="square ? undefined : 72" :ry="square ? undefined : 72" fill="#FFFFFF" />
    </mask>
    <g :mask="`url(#${maskId})`">
      <rect width="36" height="36" :fill="data.backgroundColor" />
      <rect
        x="0"
        y="0"
        width="36"
        height="36"
        :transform="`translate(${data.wrapperTranslateX} ${data.wrapperTranslateY}) rotate(${data.wrapperRotate} 18 18) scale(${data.wrapperScale})`"
        :fill="data.wrapperColor"
        :rx="data.isCircle ? 36 : 6"
        :ry="data.isCircle ? 36 : 6"
      />
      <g
        :transform="`translate(${data.faceTranslateX} ${data.faceTranslateY}) rotate(${data.faceRotate} 18 18)`"
      >
        <path
          v-if="data.isMouthOpen"
          :d="`M15 ${19 + data.mouthSpread}c2 1 4 1 6 0`"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          :style="{ color: data.faceColor }"
        />
        <path
          v-else
          :d="`M13,${19 + data.mouthSpread} a1,0.75 0 0,0 10,0`"
          :fill="data.faceColor"
        />
        <rect
          x="14"
          :y="14 + data.eyeSpread"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          :fill="data.faceColor"
        />
        <rect
          x="20"
          :y="14 + data.eyeSpread"
          width="1.5"
          height="2"
          rx="1"
          stroke="none"
          :fill="data.faceColor"
        />
      </g>
    </g>
  </svg>
</template>
