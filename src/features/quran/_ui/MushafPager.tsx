import { PAGE_COUNT } from "@/features/azkar/_data/quran";
import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import PagerView, {
  type PageScrollStateChangedNativeEvent,
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { scheduleOnRN } from "react-native-worklets";
import MushafPagerSlot from "./MushafPagerSlot";

const WINDOW = 2;
const SCROLL_WINDOW = 1;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 600;
const PAGES = Array.from({ length: PAGE_COUNT }, (_, i) => i + 1);

export default memo(function MushafPager({
  page,
  width,
  height,
  onChange,
  onTap,
  onLongPress,
  renderPage,
}: {
  page: number;
  width: number;
  height: number;
  onChange: (page: number) => void;
  onTap: () => void;
  onLongPress: (x: number, y: number) => void;
  renderPage: (page: number) => ReactNode;
}) {
  const pager = useRef<PagerView>(null);
  const shown = useRef(page);
  const committed = useRef(page);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWide(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    committed.current = page;
    if (shown.current === page) return;
    shown.current = page;
    const frame = requestAnimationFrame(() =>
      pager.current?.setPageWithoutAnimation(page - 1),
    );
    return () => cancelAnimationFrame(frame);
  }, [page]);

  const size = useRef({ width, height });

  useEffect(() => {
    const before = size.current;
    size.current = { width, height };
    if (before.width === width && before.height === height) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() =>
        pager.current?.setPageWithoutAnimation(shown.current - 1),
      );
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [width, height]);

  const commit = useCallback(() => {
    if (shown.current === committed.current) return;
    committed.current = shown.current;
    onChange(shown.current);
  }, [onChange]);

  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const next = e.nativeEvent.position + 1;
      if (next === shown.current) return;
      shown.current = next;
      commit();
    },
    [commit],
  );

  const onPageScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) => {
      if (e.nativeEvent.pageScrollState === "idle") commit();
    },
    [commit],
  );

  const scrollMode = width > height;
  const window = scrollMode ? SCROLL_WINDOW : WINDOW;

  const turn = useCallback((step: number) => {
    const target = Math.min(PAGE_COUNT, Math.max(1, shown.current + step));
    if (target !== shown.current) pager.current?.setPage(target - 1);
  }, []);

  const gesture = useMemo(() => {
    const swipe = Gesture.Pan()
      .enabled(scrollMode)
      .activeOffsetX([-24, 24])
      .failOffsetY([-10, 10])
      .onEnd((e) => {
        if (
          Math.abs(e.translationX) > SWIPE_DISTANCE ||
          Math.abs(e.velocityX) > SWIPE_VELOCITY
        ) {
          scheduleOnRN(turn, e.translationX > 0 ? 1 : -1);
        }
      });
    const tap = Gesture.Tap()
      .maxDuration(250)
      .maxDistance(10)
      .onEnd((_e, success) => {
        if (success) scheduleOnRN(onTap);
      });
    const longPress = Gesture.LongPress()
      .minDuration(450)
      .onStart((e) => {
        scheduleOnRN(onLongPress, e.x, e.y);
      });
    return Gesture.Race(swipe, Gesture.Exclusive(longPress, tap));
  }, [scrollMode, turn, onTap, onLongPress]);

  const pages = useMemo(
    () =>
      PAGES.map((p) => (
        <MushafPagerSlot
          key={p}
          page={p}
          renderPage={
            Math.abs(p - page) <= (wide ? window : 0) ? renderPage : undefined
          }
        />
      )),
    [page, wide, window, renderPage],
  );

  return (
    <GestureDetector gesture={gesture}>
      <PagerView
        ref={pager}
        style={{ width, height }}
        initialPage={page - 1}
        layoutDirection="rtl"
        scrollEnabled={!scrollMode}
        offscreenPageLimit={1}
        onPageSelected={onPageSelected}
        onPageScrollStateChanged={onPageScrollStateChanged}
      >
        {pages}
      </PagerView>
    </GestureDetector>
  );
});
