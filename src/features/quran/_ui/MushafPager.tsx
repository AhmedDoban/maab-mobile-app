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
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { scheduleOnRN } from "react-native-worklets";

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
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWide(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (shown.current === page) return;
    shown.current = page;
    const frame = requestAnimationFrame(() =>
      pager.current?.setPageWithoutAnimation(page - 1),
    );
    return () => cancelAnimationFrame(frame);
  }, [page]);

  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const next = e.nativeEvent.position + 1;
      if (next === shown.current) return;
      shown.current = next;
      onChange(next);
    },
    [onChange],
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
        <View key={p} style={{ width, height }}>
          {Math.abs(p - page) <= (wide ? WINDOW : 0) ? renderPage(p) : null}
        </View>
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
      >
        {pages}
      </PagerView>
    </GestureDetector>
  );
});
