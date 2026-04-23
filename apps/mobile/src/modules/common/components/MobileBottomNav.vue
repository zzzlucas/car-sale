<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] md:hidden">
    <div class="mobile-bottom-nav relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[26px] p-[6px]">
      <div aria-hidden="true" class="pointer-events-none absolute inset-[1px] overflow-hidden rounded-[25px]">
        <div class="mobile-bottom-nav__shine absolute inset-x-10 top-[2px] h-10 rounded-full" />
        <div class="mobile-bottom-nav__caustic absolute -left-10 bottom-0 h-16 w-24 rounded-full" />
        <div class="mobile-bottom-nav__caustic mobile-bottom-nav__caustic--right absolute -right-8 top-3 h-14 w-24 rounded-full" />
      </div>
      <div aria-hidden="true" class="pointer-events-none absolute inset-x-6 top-[7px] h-px rounded-full bg-gradient-to-r from-white/0 via-white/95 to-white/0" />

      <div
        ref="trackRef"
        class="mobile-bottom-nav__track relative grid h-[48px] grid-cols-4 items-stretch"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
        @lostpointercapture="handlePointerCancel"
      >
        <div
          aria-hidden="true"
          class="mobile-bottom-nav__slider absolute inset-y-0 rounded-[17px]"
          :class="isDragging ? 'transition-none' : 'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'"
          :style="sliderStyle"
        >
          <div class="mobile-bottom-nav__slider-gloss absolute inset-x-4 top-[3px] h-[38%] rounded-full" />
          <div class="absolute inset-x-5 bottom-[4px] h-px rounded-full bg-white/45" />
        </div>

        <button
          v-for="(item, index) in items"
          :key="item.to"
          type="button"
          class="mobile-bottom-nav__item relative z-10 flex min-w-0 flex-col items-center justify-center gap-[2px] rounded-[17px] px-2 transition-[color,transform] duration-200 active:scale-[0.98]"
          :class="displayIndex === index ? 'text-[#162027]' : 'text-[#667078]'"
          :aria-current="activeIndex === index ? 'page' : undefined"
          :aria-label="item.label"
          :style="{
            '--nav-icon-fill': displayIndex === index ? 1 : 0,
            '--nav-icon-weight': displayIndex === index ? 560 : 460,
          }"
          @click="handleTabClick(index)"
        >
          <span class="mobile-bottom-nav__icon material-symbols-outlined">{{ item.icon }}</span>
          <span class="mobile-bottom-nav__label truncate">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  MOBILE_BOTTOM_NAV_ITEMS,
  clampSliderTranslateX,
  findActiveTabIndex,
  getSliderTranslateXFromOffset,
  getSliderTranslateX,
  getTabIndexFromOffset,
} from "./mobileBottomNav";

const route = useRoute();
const router = useRouter();

const items = MOBILE_BOTTOM_NAV_ITEMS;
const trackRef = ref<HTMLElement | null>(null);
const trackWidth = ref(0);
const visualIndex = ref<number | null>(null);
const suppressClick = ref(false);

const gesture = reactive({
  pointerId: null as number | null,
  startX: 0,
  startY: 0,
  pointerX: 0,
  trackLeft: 0,
  dragging: false,
});

const activeIndex = computed(() => findActiveTabIndex(route.path, items));
const isDragging = computed(() => gesture.dragging);
const itemWidth = computed(() => (items.length > 0 ? trackWidth.value / items.length : 0));
const sliderWidth = computed(() => Math.max(itemWidth.value - 10, 0));

const displayIndex = computed(() => {
  if (gesture.dragging && itemWidth.value > 0) {
    return getTabIndexFromOffset(gesture.pointerX - gesture.trackLeft, trackWidth.value, items.length);
  }

  return visualIndex.value ?? activeIndex.value;
});

const sliderTranslateX = computed(() => {
  if (itemWidth.value <= 0 || sliderWidth.value <= 0) {
    return 0;
  }

  const nextTranslateX = gesture.dragging
    ? getSliderTranslateXFromOffset(gesture.pointerX - gesture.trackLeft, trackWidth.value, sliderWidth.value)
    : getSliderTranslateX(displayIndex.value, itemWidth.value, sliderWidth.value);

  return clampSliderTranslateX(nextTranslateX, {
    trackWidth: trackWidth.value,
    sliderWidth: sliderWidth.value,
  });
});

const sliderStyle = computed(() => ({
  width: `${sliderWidth.value}px`,
  transform: `translateX(${sliderTranslateX.value}px)`,
}));

watch(activeIndex, (nextIndex) => {
  if (!gesture.dragging && visualIndex.value === nextIndex) {
    visualIndex.value = null;
  }
});

function measureTrack() {
  trackWidth.value = trackRef.value?.clientWidth ?? 0;
}

function resetGesture(pointerId?: number) {
  if (pointerId !== undefined && trackRef.value?.hasPointerCapture(pointerId)) {
    trackRef.value.releasePointerCapture(pointerId);
  }

  gesture.pointerId = null;
  gesture.startX = 0;
  gesture.startY = 0;
  gesture.pointerX = 0;
  gesture.trackLeft = 0;
  gesture.dragging = false;
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  gesture.pointerId = event.pointerId;
  gesture.startX = event.clientX;
  gesture.startY = event.clientY;
  gesture.pointerX = event.clientX;
  gesture.trackLeft = trackRef.value?.getBoundingClientRect().left ?? 0;
  gesture.dragging = false;
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerId !== gesture.pointerId) {
    return;
  }

  const deltaX = event.clientX - gesture.startX;
  const deltaY = event.clientY - gesture.startY;

  if (!gesture.dragging) {
    if (Math.abs(deltaX) < 6 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    trackRef.value?.setPointerCapture(event.pointerId);
    gesture.dragging = true;
  }

  gesture.pointerX = event.clientX;
  event.preventDefault();
}

async function handlePointerUp(event: PointerEvent) {
  if (event.pointerId !== gesture.pointerId) {
    return;
  }

  const wasDragging = gesture.dragging;
  const nextIndex = wasDragging
    ? getTabIndexFromOffset(gesture.pointerX - gesture.trackLeft, trackWidth.value, items.length)
    : activeIndex.value;

  resetGesture(event.pointerId);

  if (!wasDragging || itemWidth.value <= 0) {
    return;
  }

  suppressClick.value = true;
  window.setTimeout(() => {
    suppressClick.value = false;
  }, 0);

  visualIndex.value = nextIndex;

  if (nextIndex !== activeIndex.value) {
    await router.push(items[nextIndex].to);
    return;
  }

  visualIndex.value = null;
}

function handlePointerCancel(event: PointerEvent) {
  if (event.pointerId !== gesture.pointerId) {
    return;
  }

  resetGesture(event.pointerId);
}

async function handleTabClick(index: number) {
  if (suppressClick.value) {
    return;
  }

  visualIndex.value = index;

  if (index === activeIndex.value) {
    return;
  }

  await router.push(items[index].to);
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  measureTrack();

  if (typeof ResizeObserver !== "undefined" && trackRef.value) {
    resizeObserver = new ResizeObserver(() => {
      measureTrack();
    });
    resizeObserver.observe(trackRef.value);
  }

  window.addEventListener("resize", measureTrack);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", measureTrack);
});
</script>
