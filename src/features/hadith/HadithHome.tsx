import CompactHeroBar from "@/components/hero/CompactHeroBar";
import PageHero, { PageHeroProps } from "@/components/hero/PageHero";
import { PAGE_MOSQUES } from "@/constants/mosques";
import useCompactHero from "@/hooks/useCompactHero";
import useDirection from "@/hooks/useDirection";
import useTabBarSpace from "@/hooks/useTabBarSpace";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListRenderItem, View } from "react-native";
import Animated from "react-native-reanimated";
import useHadithPagination from "./_components/useHadithPagination";
import { LocalHadith } from "./_data";
import HadithIntro from "./_ui/HadithIntro";
import HadithListFooter from "./_ui/HadithListFooter";
import HadithListItem from "./_ui/HadithListItem";

const HERO = 220;

const renderHadith: ListRenderItem<LocalHadith> = ({ item }) => (
  <HadithListItem hadith={item} />
);

const keyExtractor = (item: LocalHadith) => item.id;

const NONE: LocalHadith[] = [];

export default function HadithHome() {
  const { t } = useTranslation(["common", "hadith"]);
  const { direction } = useDirection();
  const tabBarSpace = useTabBarSpace();
  const { compact, onScroll } = useCompactHero(HERO);
  const { visible, hasMore, loading, loadMore } = useHadithPagination();
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const searching = query.length > 0;

  const onChangeText = useCallback((text: string) => {
    setDraft(text);
    if (!text.trim()) setQuery("");
  }, []);

  const hero = useMemo<PageHeroProps>(
    () => ({
      title: t("tabs.hadith"),
      subtitle: t("hadith:tagline"),
      source: PAGE_MOSQUES.hadith,
      height: HERO,
      search: {
        value: draft,
        onChangeText,
        onSubmitEditing: () => setQuery(draft.trim()),
        placeholder: t("hadith:searchPlaceholder"),
      },
    }),
    [t, draft, onChangeText],
  );

  const header = useMemo(
    () => (
      <>
        <PageHero {...hero} />
        <HadithIntro query={query} />
      </>
    ),
    [hero, query],
  );

  return (
    <View className="flex-1 bg-main-bg">
      <Animated.FlatList
        className="flex-1 bg-main-bg"
        style={{ direction }}
        contentContainerClassName="gap-3"
        contentContainerStyle={{ paddingBottom: 12 + tabBarSpace }}
        scrollIndicatorInsets={{ bottom: tabBarSpace }}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        data={searching ? NONE : visible}
        keyExtractor={keyExtractor}
        initialNumToRender={4}
        windowSize={7}
        renderItem={renderHadith}
        onEndReached={searching ? undefined : loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          !searching && hasMore && loading ? HadithListFooter : null
        }
        ListHeaderComponent={header}
      />
      <CompactHeroBar hero={hero} visible={compact} />
    </View>
  );
}
