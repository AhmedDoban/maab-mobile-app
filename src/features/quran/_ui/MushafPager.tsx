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
  const idle = useRef(true);
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
      if (idle.current || Math.abs(next - committed.current) >= WINDOW) {
        commit();
      }
    },
    [commit],
  );

  const onPageScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) => {
      idle.current = e.nativeEvent.pageScrollState === "idle";
      if (idle.current) commit();
    },
    [commit],
  );

  const gesture = useMemo(() => {
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
    return Gesture.Exclusive(longPress, tap);
  }, [onTap, onLongPress]);

  const pages = useMemo(
    () =>
      PAGES.map((p) => (
        <MushafPagerSlot
          key={p}
          page={p}
          width={width}
          height={height}
          renderPage={
            Math.abs(p - page) <= (wide ? WINDOW : 0) ? renderPage : undefined
          }
        />
      )),
    [page, wide, width, height, renderPage],
  );

  return (
    <GestureDetector gesture={gesture}>
      <PagerView
        ref={pager}
        style={{ width, height }}
        initialPage={page - 1}
        layoutDirection="rtl"
        offscreenPageLimit={1}
        onPageSelected={onPageSelected}
        onPageScrollStateChanged={onPageScrollStateChanged}
      >
        {pages}
      </PagerView>
    </GestureDetector>
  );
});
