export type MobileBottomNavItem = {
  to: string;
  label: string;
  icon: string;
  matches: string[];
};

export const MOBILE_BOTTOM_NAV_ITEMS: MobileBottomNavItem[] = [
  { to: "/customer", label: "首页", icon: "home", matches: ["/customer"] },
  { to: "/customer/valuation", label: "报废", icon: "recycling", matches: ["/customer/valuation"] },
  { to: "/customer/records", label: "预约记录", icon: "history_edu", matches: ["/customer/records", "/customer/progress"] },
  { to: "/customer/me", label: "我的", icon: "person", matches: ["/customer/me"] },
];

export type SnapTabIndexOptions = {
  originIndex: number;
  deltaX: number;
  itemWidth: number;
  itemCount: number;
};

export type SliderMetrics = {
  trackWidth: number;
  sliderWidth: number;
};

function matchesPath(path: string, match: string) {
  return path === match || path.startsWith(`${match}/`);
}

export function findActiveTabIndex(path: string, items: MobileBottomNavItem[] = MOBILE_BOTTOM_NAV_ITEMS) {
  let bestIndex = 0;
  let bestMatchLength = -1;

  items.forEach((item, index) => {
    item.matches.forEach((match) => {
      if (matchesPath(path, match) && match.length > bestMatchLength) {
        bestIndex = index;
        bestMatchLength = match.length;
      }
    });
  });

  return bestMatchLength >= 0 ? bestIndex : 0;
}

export function clampTabIndex(index: number, itemCount: number) {
  if (itemCount <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), itemCount - 1);
}

export function snapTabIndex({ originIndex, deltaX, itemWidth, itemCount }: SnapTabIndexOptions) {
  if (itemCount <= 1 || itemWidth <= 0) {
    return clampTabIndex(originIndex, itemCount);
  }

  const movedSteps = Math.round(deltaX / itemWidth);
  return clampTabIndex(originIndex + movedSteps, itemCount);
}

export function getTabIndexFromOffset(offsetX: number, trackWidth: number, itemCount: number) {
  if (itemCount <= 1 || trackWidth <= 0) {
    return 0;
  }

  const itemWidth = trackWidth / itemCount;
  const clampedOffset = Math.min(Math.max(offsetX, 0), Math.max(trackWidth - 1, 0));
  return clampTabIndex(Math.floor(clampedOffset / itemWidth), itemCount);
}

export function getSliderTranslateX(index: number, itemWidth: number, sliderWidth: number) {
  return index * itemWidth + (itemWidth - sliderWidth) / 2;
}

export function clampSliderTranslateX(translateX: number, { trackWidth, sliderWidth }: SliderMetrics) {
  const maxTranslateX = Math.max(trackWidth - sliderWidth, 0);
  return Math.min(Math.max(translateX, 0), maxTranslateX);
}

export function getSliderTranslateXFromOffset(offsetX: number, trackWidth: number, sliderWidth: number) {
  return clampSliderTranslateX(offsetX - sliderWidth / 2, {
    trackWidth,
    sliderWidth,
  });
}
