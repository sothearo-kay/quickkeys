<script setup lang="ts">
import { useSpring } from "motion-v";

const props = withDefaults(defineProps<{
  data: number[];
  showLabels?: boolean;
}>(), { showLabels: true });

const wrapperRef = ref<HTMLDivElement | null>(null);
const dimensions = ref({ width: 0, height: 0 });

const PAD = computed(() => ({ top: 0, right: 4, bottom: props.showLabels ? 22 : 4, left: 0 }));

useResizeObserver(wrapperRef, ([entry]) => {
  if (!entry)
    return;
  dimensions.value = {
    width: entry.contentRect.width,
    height: entry.contentRect.height,
  };
});

const W = computed(() => Math.max(0, dimensions.value.width - PAD.value.left - PAD.value.right));
const H = computed(() => Math.max(0, dimensions.value.height - PAD.value.top - PAD.value.bottom));

const yMin = computed(() => Math.floor(Math.min(...props.data) / 10) * 10);
const yMax = computed(() => Math.max(...props.data) + 5);

function xScale(i: number) {
  return props.data.length < 2 ? 0 : (i / (props.data.length - 1)) * W.value;
}

function yScale(val: number) {
  const range = yMax.value - yMin.value || 1;
  return H.value - ((val - yMin.value) / range) * H.value;
}

const linePath = computed(() => smoothPath(props.data));

// Smooth catmull-rom → cubic bezier
function smoothPath(data: number[]): string {
  if (!data.length || W.value <= 0)
    return "";
  const pts: [number, number][] = data.map((v, i) => [xScale(i), yScale(v)]);
  if (pts.length === 1)
    return `M ${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`;
  let d = `M ${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const areaPath = computed(() => {
  if (!linePath.value)
    return "";
  const last = props.data.length - 1;
  return `${linePath.value} L ${xScale(last).toFixed(1)} ${H.value} L 0 ${H.value} Z`;
});

const springX = useSpring(0, { damping: 25, stiffness: 130 });
const springY = useSpring(0, { damping: 25, stiffness: 130 });

const curX = ref(0);
const curY = ref(0);

let rafId = 0;
function trackSprings() {
  curX.value = springX.get();
  curY.value = springY.get();
  rafId = requestAnimationFrame(trackSprings);
}

onMounted(() => {
  rafId = requestAnimationFrame(trackSprings);
});

onUnmounted(() => cancelAnimationFrame(rafId));

const isHovering = ref(false);
const hoveredWpm = ref<number | null>(null);

const springWpm = computed(() => {
  if (!isHovering.value || H.value <= 0)
    return null;
  const range = yMax.value - yMin.value || 1;
  return Math.round(yMin.value + ((H.value - curY.value) / H.value) * range);
});

const xTicks = computed(() => {
  const n = props.data.length;
  if (n < 2)
    return [0];
  const step = n <= 30 ? 4 : n <= 60 ? 8 : 16;
  const ticks: number[] = [];
  for (let i = 0; i < n; i += step) ticks.push(i);
  const last = n - 1;
  if (ticks[ticks.length - 1] !== last) {
    // Replace last tick if too close, otherwise append
    if (last - (ticks[ticks.length - 1] ?? 0) < Math.ceil(step * 0.6))
      ticks[ticks.length - 1] = last;
    else
      ticks.push(last);
  }
  return ticks;
});

function onMouseMove(e: MouseEvent) {
  if (!wrapperRef.value)
    return;
  const rect = wrapperRef.value.getBoundingClientRect();
  const mx = e.clientX - rect.left - PAD.value.left;
  const my = e.clientY - rect.top - PAD.value.top;

  if (mx < 0 || mx > W.value || my < 0 || my > H.value) {
    onMouseLeave();
    return;
  }

  isHovering.value = true;
  const idx = Math.max(0, Math.min(props.data.length - 1, Math.round((mx / W.value) * (props.data.length - 1))));
  const wpm = props.data[idx]!;
  hoveredWpm.value = wpm;
  springX.set(xScale(idx));
  springY.set(yScale(wpm));
}

function onMouseLeave() {
  isHovering.value = false;
  hoveredWpm.value = null;
}
</script>

<template>
  <div
    ref="wrapperRef"
    class="relative h-52 w-full cursor-crosshair select-none"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- WPM badge — spring-animated, follows cursor X -->
    <Transition name="badge">
      <div
        v-if="isHovering && springWpm !== null"
        class="pointer-events-none absolute z-10 -translate-x-1/2"
        :style="`top: -4px; left: clamp(20px, ${curX}px, calc(100% - 20px))`"
      >
        <div class="rounded-sm bg-primary px-2 py-1 text-xs leading-none font-bold whitespace-nowrap text-background">
          {{ springWpm }} wpm
        </div>
      </div>
    </Transition>

    <svg class="h-full w-full" style="font-family: inherit; overflow: visible;">
      <defs>
        <linearGradient id="wpm-fill-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style="stop-color: var(--color-primary); stop-opacity: 0.38" />
          <stop offset="80%" style="stop-color: var(--color-primary); stop-opacity: 0.05" />
          <stop offset="100%" style="stop-color: var(--color-primary); stop-opacity: 0" />
        </linearGradient>

        <!-- Clip path width driven by spring value — creates the reveal effect -->
        <clipPath id="wpm-reveal-clip">
          <rect x="0" y="-50" :width="curX" height="2000" />
        </clipPath>
      </defs>

      <g :transform="`translate(${PAD.left}, ${PAD.top})`">
        <!-- Ghost: full faint line behind (visible on hover) -->
        <path
          :d="linePath"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="1.5"
          stroke-linejoin="round"
          stroke-linecap="round"
          :style="`opacity: ${isHovering ? 0.12 : 0}; transition: opacity 0.2s`"
        />

        <!-- Top border line -->
        <line
          x1="0" :x2="W"
          y1="0" y2="0"
          stroke="var(--color-border)"
          stroke-width="1"
          stroke-dasharray="4 4"
          stroke-linecap="round"
          opacity="0.4"
        />

        <!-- Bottom border line -->
        <line
          x1="0" :x2="W"
          :y1="H" :y2="H"
          stroke="var(--color-border)"
          stroke-width="1"
          stroke-dasharray="4 4"
          stroke-linecap="round"
          opacity="0.4"
        />

        <!-- Full area (no hover state) -->
        <g :style="`opacity: ${isHovering ? 0 : 1}; transition: opacity 0.2s`">
          <path :d="areaPath" fill="url(#wpm-fill-gradient)" />
          <path
            :d="linePath"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>

        <!-- Spring-clipped area — only left of cursor, spring-animated -->
        <g clip-path="url(#wpm-reveal-clip)" :style="`opacity: ${isHovering ? 1 : 0}; transition: opacity 0.2s`">
          <path :d="areaPath" fill="url(#wpm-fill-gradient)" />
          <path
            :d="linePath"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>

        <!-- Crosshair: vertical line spanning top border → bottom border + dot -->
        <g :style="`opacity: ${isHovering ? 1 : 0}; transition: opacity 0.15s`">
          <line
            :x1="curX" :x2="curX"
            y1="0" :y2="H"
            stroke="var(--color-primary)"
            stroke-width="1"
            stroke-dasharray="3 3"
            stroke-linecap="round"
            opacity="0.3"
          />
          <circle :cx="curX" :cy="curY" r="3.5" fill="var(--color-primary)" />
        </g>

        <!-- X-axis labels -->
        <template v-if="showLabels">
          <text
            v-for="tick in xTicks"
            :key="`xl-${tick}`"
            :x="xScale(tick)"
            :y="H + 16"
            :text-anchor="tick === 0 ? 'start' : tick === props.data.length - 1 ? 'end' : 'middle'"
            font-size="10"
            fill="var(--color-muted-foreground)"
          >{{ tick + 1 }}s</text>
        </template>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.badge-enter-active,
.badge-leave-active {
  transition: opacity 0.15s;
}
.badge-enter-from,
.badge-leave-to {
  opacity: 0;
}
</style>
