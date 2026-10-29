import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import {
  AyahRef,
  ayahsOnPage,
  getPage,
  PAGE_COUNT,
  pageOf,
} from "@/features/azkar/_data/quran";
import { setQuranBookmark } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, ScaledSize, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppText from "@/components/ui/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useMushafColors from "./_components/useMushafColors";
import useThemeColors from "@/hooks/useThemeColors";
import useDirection from "@/hooks/useDirection";
import useRecitation from "./_components/useRecitation";
import useSurahName from "./_components/useSurahName";
import { preloadTafsir } from "./_components/useTafsir";
import { useKeepAwake } from "expo-keep-awake";
import usePageFade from "./_components/usePageFade";
import useRotationCover from "./_components/useRotationCover";
import MushafPage from "./_ui/MushafPage";
import MushafPager from "./_ui/MushafPager";
import { hitTest } from "./_components/pageHitTest";
import PageSlider from "./_ui/PageSlider";
import RecitationPlayer from "./_ui/RecitationPlayer";
import NoInternetDialog from "@/components/ui/NoInternetDialog";
import AyahSheet from "./_ui/AyahSheet";

const TAFSIR_DELAY_MS = 800;
const AREA_SETTLE_MS = 80;

export default function SurahReader({
  id,
  ayah,
  page: startPage,
}: {
  id: number;
  ayah?: number;
  page?: number;
}) {
  const t0 = Date.now();
  require("react").useLayoutEffect(() => { console.log("ROTPERF reader", Date.now() - t0); });
  const { t, i18n } = useTranslation("azkar");
  const ar = i18n.language === "ar";
  const surahName = useSurahName();
  const c = useMushafColors();
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      gestureEnabled: false,
      fullScreenGestureEnabled: false,
      contentStyle: { backgroundColor: c.page },
    }),
    [c.page],
  );
  const theme = useThemeColors();
  const { isRTL, direction } = useDirection();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const side = Math.max(insets.left, insets.right);
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  const recitation = useRecitation();

  const initial = useMemo(
    () => startPage ?? pageOf(id, ayah ?? 1),
    [id, ayah, startPage],
  );
  const [page, setPage] = useState(initial);
  const [area, setArea] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [selected, setSelected] = useState<AyahRef | null>(
    ayah ? { surah: id, ayah } : null,
  );
  const active = recitation.current ?? selected;
  const [chrome, setChrome] = useState(true);

  useKeepAwake();

  useEffect(() => {
    const timer = setTimeout(() => preloadTafsir(ar, id), TAFSIR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ar, id]);
  const [sheetAyah, setSheetAyah] = useState<AyahRef | null>(null);
  const fade = useSharedValue(1);

  useEffect(() => {
    fade.set(withTiming(chrome ? 1 : 0, { duration: 200 }));
  }, [chrome, fade]);

  const chromeStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  const toggleChrome = useCallback(() => setChrome((v) => !v), []);

  const jump = useCallback((target: number) => {
    setPage(Math.min(PAGE_COUNT, Math.max(1, target)));
  }, []);

  const pageFade = usePageFade();
  const rotation = useRotationCover();
  const revealRotation = rotation.reveal;
  const hideRotation = rotation.hide;
  const pendingArea = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(pendingArea.current), []);

  useEffect(() => {
    let last = Dimensions.get("window");
    const sub = Dimensions.addEventListener("change", ({ window }: { window: ScaledSize }) => {
      if (window.width === last.width && window.height === last.height) return;
      last = window;
      console.log("ROTPERF dims", Date.now());
      hideRotation();
    });
    return () => sub.remove();
  }, [hideRotation]);
  useEffect(() => {
    console.log("ROTPERF commit", Date.now(), JSON.stringify(area));
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => { console.log("ROTPERF reveal", Date.now()); revealRotation(); });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [area, revealRotation]);
  const slideTo = useCallback(
    (target: number) => {
      pageFade.fadeIn();
      jump(target);
    },
    [jump, pageFade.fadeIn],
  );

  useEffect(() => {
    const current = recitation.current;
    if (!current) return;
    const target = pageOf(current.surah, current.ayah);
    if (target !== page) jump(target);
  }, [recitation.current]);

  const onAyahLongPress = useCallback((ref: AyahRef) => {
    Haptics.selectionAsync();
    setSelected(ref);
    setSheetAyah(ref);
  }, []);

  const activePage = active ? pageOf(active.surah, active.ayah) : null;
  const playFrom = recitation.play;
  const closeSheet = useCallback(() => {
    setSheetAyah(null);
    setSelected(null);
  }, []);
  const playSheet = useCallback(
    (from: AyahRef, until: AyahRef | null) => playFrom(from, until),
    [playFrom],
  );
  const onPageLongPress = useCallback(
    (x: number, y: number) => {
      const ref = hitTest(page, x, y);
      if (ref) onAyahLongPress(ref);
    },
    [page, onAyahLongPress],
  );
  const renderPage = useCallback(
    (p: number) =>
      area ? (
        <MushafPage
          page={p}
          width={area.width}
          height={area.height}
          active={p === activePage ? active : null}
        />
      ) : null,
    [area, activePage, active],
  );

  const play = () => {
    if (recitation.current) recitation.resume();
    else recitation.play(selected ?? ayahsOnPage(page)[0]);
  };

  const bookmarkPage = bookmark ? pageOf(bookmark.surah, bookmark.ayah) : null;
  const bookmarked = bookmarkPage === page;
  const toggleBookmark = () => {
    Haptics.selectionAsync();
    dispatch(setQuranBookmark(bookmarked ? null : ayahsOnPage(page)[0]));
  };

  const title = surahName(getPage(page).start.surah);

  return (
    <View
      className="flex-1"
      style={{ direction: "rtl", backgroundColor: c.page }}
    >
      <Stack.Screen options={screenOptions} />

      <Animated.View
        className="flex-1"
        layout={rotation.layout}
        style={{
          marginTop: insets.top,
          marginBottom: insets.bottom,
          marginHorizontal: side,
        }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          console.log("ROTPERF layout", Date.now(), width, height);
          clearTimeout(pendingArea.current);
          if (width === area?.width && height === area?.height) return;
          if (!area) {
            setArea({ width, height });
            return;
          }
          pendingArea.current = setTimeout(
            () => setArea({ width, height }),
            AREA_SETTLE_MS,
          );
        }}
      >
        {area ? (
          <Animated.View style={pageFade.style}>
            <MushafPager
              page={page}
              width={area.width}
              height={area.height}
              onChange={setPage}
              onTap={toggleChrome}
              onLongPress={onPageLongPress}
              renderPage={renderPage}
            />
          </Animated.View>
        ) : null}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: c.page },
            rotation.coverStyle,
          ]}
        />
      </Animated.View>

      <Animated.View
        pointerEvents={chrome ? "box-none" : "none"}
        className="absolute inset-x-0 top-0 flex-row items-center gap-3 pb-2"
        style={[
          {
            paddingTop: insets.top + 6,
            paddingHorizontal: side + 12,
            backgroundColor: c.page,
            direction,
          },
          chromeStyle,
        ]}
      >
        <PressableScale
          onPress={() => router.back()}
          accessibilityLabel={t("close")}
          hitSlop={10}
          className="size-10 items-center justify-center"
        >
          <Icon
            name={isRTL ? "chevronRight" : "chevronLeft"}
            size={26}
            strokeWidth={2}
            tintColor={theme.isDark ? "#ffffff" : theme.main}
          />
        </PressableScale>
        <AppText
          variant={ar ? "quran" : "ui"}
          weight="bold"
          className={ar ? "flex-1 text-xl" : "flex-1 text-lg"}
          style={{ color: c.ink, textAlign: "center" }}
          numberOfLines={1}
        >
          {t("surahTitle", { name: title })}
        </AppText>
        <View className="size-10" />
      </Animated.View>

      <Animated.View
        pointerEvents={chrome ? "box-none" : "none"}
        className="absolute inset-x-0 bottom-0 gap-3 pt-3"
        style={[
          {
            paddingBottom: insets.bottom + 8,
            paddingHorizontal: side + 16,
            backgroundColor: c.page,
          },
          chromeStyle,
        ]}
      >
        <RecitationPlayer
          current={recitation.current}
          playing={recitation.playing}
          loading={recitation.loading}
          onPlay={play}
          onPause={recitation.pause}
          onStop={recitation.stop}
        />
        <View
          className="flex-row items-center gap-3"
          style={{ direction: "rtl" }}
        >
          <PressableScale
            onPress={toggleBookmark}
            accessibilityLabel={t(
              bookmarked ? "removeBookmark" : "bookmarkPage",
            )}
            className="size-10 items-center justify-center"
          >
            <Icon
              name={bookmarked ? "bookmarkFill" : "bookmark"}
              size={24}
              tintColor={c.accent}
            />
          </PressableScale>
          <PageSlider page={page} onChange={slideTo} />
          <PressableScale
            onPress={() => bookmarkPage && jump(bookmarkPage)}
            disabled={!bookmark || bookmarked}
            accessibilityLabel={t("goToBookmark")}
            className="size-10 items-center justify-center"
            style={{ opacity: !bookmark || bookmarked ? 0.3 : 1 }}
          >
            <Icon name="reset" size={22} tintColor={c.accent} />
          </PressableScale>
        </View>
      </Animated.View>
      <AyahSheet ayah={sheetAyah} onClose={closeSheet} onPlay={playSheet} />
      <NoInternetDialog
        visible={recitation.offline}
        onClose={recitation.dismissOffline}
      />
    </View>
  );
}
