import HijriDateChip from "@/features/prayer-times/_ui/HijriDateChip";
import MihrabArt from "@/components/art/MihrabArt";
import CompactHeroBar from "@/components/hero/CompactHeroBar";
import IllustratedHero from "@/components/hero/IllustratedHero";
import type { HeroAction, HeroSearch } from "@/components/hero/heroTypes";
import ContentColumn from "@/components/ui/ContentColumn";
import EmptyState from "@/components/ui/EmptyState";
import PrayerTimesCard from "@/features/prayer-times/PrayerTimesCard";
import useCompactHero from "@/hooks/useCompactHero";
import useDirection from "@/hooks/useDirection";
import useTabBarSpace from "@/hooks/useTabBarSpace";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { isFriday, searchCategories } from "./_data";
import CategoryGrid from "./_ui/CategoryGrid";
import DailyJourneyCard from "./_ui/DailyJourneyCard";
import DailyWirdSection from "./_ui/DailyWirdSection";
import ExploreSection from "./_ui/ExploreSection";
import VerseOfDayCard from "./_ui/VerseOfDayCard";

const ART = <MihrabArt />;
const LEADING = <HijriDateChip />;

const COMPACT_HEIGHT = 150;

const openFavorites = () => router.push("/favorites");

export default function AzkarHome() {
  const { t } = useTranslation(["azkar", "common"]);
  const { direction } = useDirection();
  const tabBarSpace = useTabBarSpace();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCategories(query), [query]);
  const searching = query.trim().length > 0;
  const friday = isFriday();
  const { compact, onScroll } = useCompactHero(COMPACT_HEIGHT);

  const search = useMemo<HeroSearch>(
    () => ({
      value: query,
      onChangeText: setQuery,
      placeholder: t("searchPlaceholder"),
    }),
    [t, query],
  );
  const action = useMemo<HeroAction>(
    () => ({
      icon: "heart",
      label: t("openFavorites"),
      onPress: openFavorites,
    }),
    [t],
  );
  const bar = useMemo(
    () => ({ title: t("common:tabs.azkar"), search, action }),
    [t, search, action],
  );
  const contentStyle = useMemo(
    () => ({ paddingBottom: tabBarSpace + 24 }),
    [tabBarSpace],
  );

  return (
    <View className="flex-1 bg-main-bg">
      <Animated.ScrollView
        className="flex-1 bg-main-bg"
        style={{ direction }}
        contentContainerStyle={contentStyle}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <IllustratedHero
          title={t("greeting")}
          subtitle={t("homeTagline")}
          art={ART}
          leading={LEADING}
          search={search}
          action={action}
        />
        <ContentColumn className="gap-6 px-4">
          {searching ? (
            results.length > 0 ? (
              <CategoryGrid categories={results} />
            ) : (
              <EmptyState icon="search" title={t("noResults")} />
            )
          ) : (
            <>
              <PrayerTimesCard />
              <DailyWirdSection friday={friday} />
              <VerseOfDayCard />
              <ExploreSection />
              <DailyJourneyCard friday={friday} />
            </>
          )}
        </ContentColumn>
      </Animated.ScrollView>
      <CompactHeroBar hero={bar} visible={compact} overImage={false} />
    </View>
  );
}
