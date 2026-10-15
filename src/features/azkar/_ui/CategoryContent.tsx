import useContentColumn from "@/hooks/useContentColumn";
import useThemeColors from "@/hooks/useThemeColors";
import { ListRenderItem, Platform } from "react-native";
import { useCallback, useMemo } from "react";
import { shallowEqual } from "react-redux";
import { Stack } from "expo-router";
import useDirection from "@/hooks/useDirection";
import {
  progressKey,
  resetCategory,
  toggleFavorite,
} from "@/store/Slices/AzkarSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { getCategory, getItems, Zikr } from "../_data";
import useCategoryProgress from "../_components/useCategoryProgress";
import useCategoryScreenOptions from "../_components/useCategoryScreenOptions";
import CategoryCompletedBanner from "./CategoryCompletedBanner";
import ZikrCard from "./ZikrCard";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import TopProgressBar from "./TopProgressBar";
import * as Haptics from "expo-haptics";

const ENTERING = FadeIn.duration(250);
const EXITING = FadeOut.duration(250);
const LAYOUT = LinearTransition.duration(250).easing(Easing.out(Easing.cubic));
const CONTENT_STYLE = { gap: 16, padding: 16, paddingBottom: 32 };
const keyExtractor = (zikr: Zikr) => String(zikr.id);

export default function CategoryContent({
  categoryId,
  title,
}: {
  categoryId: string;
  title: string;
}) {
  const dispatch = useAppDispatch();
  const category = getCategory(categoryId)!;
  const allItems = useMemo(() => getItems(categoryId), [categoryId]);
  const progress = useCategoryProgress(category);
  const isFavorite = useAppSelector((s) =>
    s.azkar.favorites.includes(categoryId),
  );
  const hideCompleted = useAppSelector((s) => s.settings.reading.hideCompleted);
  const items = useAppSelector(
    (s) =>
      hideCompleted
        ? allItems.filter(
            (zikr) =>
              (s.azkar.progress[progressKey(categoryId, zikr.id)] ?? 0) <
              zikr.count,
          )
        : allItems,
    shallowEqual,
  );

  const colors = useThemeColors();
  const { direction } = useDirection();

  const onReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(resetCategory(categoryId));
  }, [dispatch, categoryId]);
  const onToggleFavorite = useCallback(() => {
    Haptics.selectionAsync();
    dispatch(toggleFavorite(categoryId));
  }, [dispatch, categoryId]);

  const options = useCategoryScreenOptions({
    title,
    isFavorite,
    canReset: progress.done > 0,
    onReset,
    onToggleFavorite,
  });

  const style = useMemo(
    () => ({ flex: 1, backgroundColor: colors.bg, direction }),
    [colors.bg, direction],
  );

  const column = useContentColumn();
  const renderItem = useCallback<ListRenderItem<Zikr>>(
    ({ item: zikr }) => (
      <Animated.View
        className="w-full max-w-3xl self-center"
        style={column}
        entering={hideCompleted ? ENTERING : undefined}
        exiting={hideCompleted ? EXITING : undefined}
      >
        <ZikrCard categoryId={categoryId} zikr={zikr} />
      </Animated.View>
    ),
    [hideCompleted, categoryId, column],
  );

  return (
    <>
      <Stack.Screen options={options} />
      <Animated.FlatList
        style={style}
        contentContainerStyle={CONTENT_STYLE}
        contentInsetAdjustmentBehavior="automatic"
        data={items}
        keyExtractor={keyExtractor}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        itemLayoutAnimation={hideCompleted ? LAYOUT : undefined}
        ListHeaderComponent={progress.complete ? CategoryCompletedBanner : null}
        renderItem={renderItem}
      />
      <TopProgressBar done={progress.done} total={progress.total} />
    </>
  );
}
