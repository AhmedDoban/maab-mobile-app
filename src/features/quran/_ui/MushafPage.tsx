import Icon from "@/components/ui/Icon";
import { AyahRef, pageOf } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { Image } from "expo-image";
import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { PAGE } from "../_components/pageLayout";
import { registerHitTest } from "../_components/pageHitTest";
import usePageGeometry from "../_components/usePageGeometry";
import useMushafColors from "../_components/useMushafColors";
import { ayahAt, getPageAyahs } from "../_data/pageAyahs";
import { PAGE_IMAGES } from "../_data/pageImages";
import { getPageMeta } from "../_data/pageMeta";
import MushafPageFooter from "./MushafPageFooter";
import MushafPageHeader from "./MushafPageHeader";
import PageMarkers from "./PageMarkers";
import PageUnderlay from "./PageUnderlay";

const VISIBLE = { ...StyleSheet.absoluteFill, opacity: 1 };
const HIDDEN = { ...StyleSheet.absoluteFill, opacity: 0 };

export default memo(function MushafPage({
  page,
  width,
  height,
  active,
  priority,
}: {
  page: number;
  width: number;
  height: number;
  active: AyahRef | null;
  priority: "high" | "normal";
}) {
  const c = useMushafColors();
  const meta = getPageMeta(page);
  const ayahs = getPageAyahs(page);
  const geometry = usePageGeometry(page, width, height, meta.viewBox);
  const scrollY = useRef(0);
  const [shown, setShown] = useState(false);
  const onShown = useCallback(() => setShown(true), []);
  const layer = shown ? VISIBLE : HIDDEN;
  const fit = geometry.stretch ? "none" : "xMidYMid meet";
  const bookmarked = useAppSelector((s) =>
    s.settings.quranBookmark
      ? pageOf(
          s.settings.quranBookmark.surah,
          s.settings.quranBookmark.ayah,
        ) === page
      : false,
  );

  useEffect(
    () =>
      registerHitTest(page, (x, y) => {
        const [vx, vy] = geometry.toViewBox(x, y, scrollY.current);
        const hit = ayahAt(page, vx, vy);
        return hit ? { surah: hit.surah, ayah: hit.ayah } : null;
      }),
    [page, geometry],
  );

  const body: ReactNode = (
    <>
      <MushafPageHeader page={page} />

      {bookmarked ? (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 items-center"
          style={{ top: 0 }}
        >
          <Icon name="bookmarkFill" size={30} tintColor={c.accent} />
        </View>
      ) : null}

      <View style={{ width: geometry.textW, height: geometry.textH }}>
        <View style={layer}>
          <PageUnderlay
            meta={meta}
            ayahs={ayahs}
            active={active}
            preserveAspectRatio={fit}
          />
        </View>
        <Image
          source={PAGE_IMAGES[page - 1]}
          style={StyleSheet.absoluteFill}
          contentFit={geometry.stretch ? "fill" : "contain"}
          tintColor={c.ink}
          priority={priority}
          transition={0}
          recyclingKey={String(page)}
          onDisplay={onShown}
          onError={onShown}
        />
        <View style={layer}>
          <PageMarkers meta={meta} preserveAspectRatio={fit} />
        </View>
      </View>

      <MushafPageFooter page={page} />
    </>
  );

  const padding = {
    paddingHorizontal: PAGE.paddingX,
    paddingTop: PAGE.paddingTop,
    paddingBottom: PAGE.paddingBottom,
  };

  if (geometry.scroll) {
    return (
      <ScrollView
        style={{ width, height, direction: "rtl", backgroundColor: c.page }}
        contentContainerStyle={padding}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
      >
        {body}
      </ScrollView>
    );
  }

  return (
    <View
      style={{
        width,
        height,
        direction: "rtl",
        backgroundColor: c.page,
        ...padding,
      }}
    >
      {body}
    </View>
  );
});
