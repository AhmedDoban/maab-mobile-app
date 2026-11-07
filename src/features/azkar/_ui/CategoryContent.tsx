import useContentColumn from "@/hooks/useContentColumn";
import useFloatingTabBarSpace from "@/hooks/useFloatingTabBarSpace";
import useThemeColors from "@/hooks/useThemeColors";
import { ListRenderItem, Platform } from "react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { shallowEqual } from "react-redux";
import { Stack } from "expo-router";
import useDirection from "@/hooks/useDirection";
import {
  progressKey,
  recordCategoryOpen,
  resetCategory,
  completeCategory,
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
const keyExtractor = (zikr: Zikr) => String(zikr.id);

export default function CategoryContent({
  categoryId,
  title,
  widgetItem,
  onWidgetReady,
}: {
  categoryId: string;
  title: string;
  widgetItem?: string;
  onWidgetReady?: () => void;
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

  const onCompleteAll = useCallback(() => {
    if (progress.complete) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(completeCategory({ categoryId, goals: category.goals }));
  }, [category, categoryId, dispatch, progress.complete]);

  useEffect(() => {
    dispatch(recordCategoryOpen(categoryId));
  }, [dispatch, categoryId]);
  const onToggleFavorite = useCallback(() => {
    Haptics.selectionAsync();
    dispatch(toggleFavorite(categoryId));
  }, [dispatch, categoryId]);

  const options = useCategoryScreenOptions({
    title,
    isFavorite,
    canReset: progress.done > 0,
    canComplete: !progress.complete,
    onReset,
    onComplete: onCompleteAll,
    onToggleFavorite,
  });

  const style = useMemo(
    () => ({ flex: 1, backgroundColor: colors.bg, direction }),
    [colors.bg, direction],
  );

  const column = useContentColumn();
  const tabBarSpace = useFloatingTabBarSpace();
  const contentStyle = useMemo(
    () => ({ gap: 16, paddingTop: 16, paddingBottom: 32 + tabBarSpace }),
    [tabBarSpace],
  );
  const listRef = useRef<Animated.FlatList<Zikr>>(null);
  const widgetHandled = useRef(false);
  const widgetTarget = Number(widgetItem);
  const widgetIndex = allItems.findIndex((item) => item.id === widgetTarget);
  const handleContentSizeChange = useCallback(() => {
    if (
      widgetHandled.current ||
      !widgetItem ||
      !Number.isInteger(widgetTarget) ||
      widgetIndex < 0
    ) {
      return;
    }
    widgetHandled.current = true;
    listRef.current?.scrollToIndex({ index: widgetIndex, viewPosition: 0.25 });
    onWidgetReady?.();
  }, [onWidgetReady, widgetIndex, widgetItem, widgetTarget]);
  const renderItem = useCallback<ListRenderItem<Zikr>>(
    ({ item: zikr }) => (
      <Animated.View
        className="w-full max-w-3xl self-center px-4"
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
        ref={listRef}
        style={style}
        contentContainerStyle={contentStyle}
        contentInsetAdjustmentBehavior="automatic"
        data={items}
        keyExtractor={keyExtractor}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        itemLayoutAnimation={hideCompleted ? LAYOUT : undefined}
        ListHeaderComponent={
          progress.complete ? CategoryCompletedBanner : undefined
        }
        renderItem={renderItem}
        onContentSizeChange={handleContentSizeChange}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });
          requestAnimationFrame(() =>
            listRef.current?.scrollToIndex({
              index: info.index,
              viewPosition: 0.25,
            }),
          );
        }}
      />
      <TopProgressBar done={progress.done} total={progress.total} />
    </>
  );
}
