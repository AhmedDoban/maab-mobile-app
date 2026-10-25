import { router } from "expo-router";
import HijriDateChip from "@/features/prayer-times/_ui/HijriDateChip";
import ContentColumn from "@/components/ui/ContentColumn";
import CompactHeroBar from "@/components/hero/CompactHeroBar";
import MushafArt from "@/components/art/MushafArt";
import IllustratedHero from "@/components/hero/IllustratedHero";
import type { HeroBar } from "@/components/hero/heroTypes";
import { normalizeQuran } from "@/features/azkar/_data/quran";
import useCompactHero from "@/hooks/useCompactHero";
import useDirection from "@/hooks/useDirection";
import useTabBarSpace from "@/hooks/useTabBarSpace";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListRenderItem, View } from "react-native";
import Animated from "react-native-reanimated";
import useQuranRows from "./_components/useQuranRows";
import useSurahSearch from "./_components/useSurahSearch";
import useVerseSearch from "./_components/useVerseSearch";
import { QuranRow, quranRowKey } from "./_data/quranRows";
import KhatmaTab from "./_ui/KhatmaTab";
import QuranFilterChips from "./_ui/QuranFilterChips";
import QuranListRow from "./_ui/QuranListRow";
import QuranSavedSection from "./_ui/QuranSavedSection";
import QuranSearchResults from "./_ui/QuranSearchResults";
import QuranSectionTabs, { QuranSection } from "./_ui/QuranSectionTabs";

const HERO = 220;
const NONE: QuranRow[] = [];

const renderRow: ListRenderItem<QuranRow> = ({ item, index }) => (
  <QuranListRow row={item} first={index === 0} />
);

const openFavorites = () => router.push("/quran-favorites");

export default function QuranHome() {
  const { t } = useTranslation(["common", "azkar"]);
  const { direction } = useDirection();
  const tabBarSpace = useTabBarSpace();
  const { compact, onScroll } = useCompactHero(HERO);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<QuranSection>("surahs");
  const [byJuz, setByJuz] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const listByJuz = useDeferredValue(byJuz);
  const q = normalizeQuran(deferredQuery.trim());
  const searching = q.length > 0;
  const { surahRows, juzRows } = useQuranRows();
  const surahResults = useSurahSearch(q);
  const { results: verseResults } = useVerseSearch(deferredQuery);

  const onChangeText = useCallback((text: string) => setQuery(text), []);
  const hero = useMemo<HeroBar>(
    () => ({
      action: {
        icon: "heart",
        label: t("azkar:openFavorites"),
        onPress: openFavorites,
      },
      title: t("tabs.quran"),
      subtitle: t("azkar:quranTagline"),
      search: {
        value: query,
        onChangeText,
        placeholder: t("azkar:surahSearch"),
      },
    }),
    [t, query, onChangeText],
  );
  const tabLabels = useMemo(
    () => ({
      surahs: t("azkar:surahsHeading"),
      khatma: t("azkar:khatmaTab"),
      saved: t("azkar:savedTab"),
    }),
    [t],
  );

  const showList = !searching && section === "surahs";
  const data = !showList ? NONE : listByJuz ? juzRows : surahRows;

  const header = (
    <>
      <IllustratedHero
        title={hero.title}
        subtitle={hero.subtitle}
        art={<MushafArt />}
        leading={<HijriDateChip />}
        search={hero.search}
        action={hero.action}
      />
      <ContentColumn className="gap-4 px-4 pt-2">
        {searching ? (
          <QuranSearchResults surahs={surahResults} verses={verseResults} />
        ) : (
          <>
            <QuranSectionTabs
              value={section}
              onChange={setSection}
              labels={tabLabels}
            />
            {section === "surahs" ? (
              <QuranFilterChips byJuz={byJuz} onChange={setByJuz} />
            ) : null}
            {section === "khatma" ? <KhatmaTab /> : null}
            {section === "saved" ? <QuranSavedSection /> : null}
          </>
        )}
      </ContentColumn>
    </>
  );

  return (
    <View className="flex-1 bg-main-bg">
      <Animated.FlatList
        className="flex-1 bg-main-bg"
        style={{ direction }}
        contentContainerClassName="gap-2.5"
        contentContainerStyle={{ paddingBottom: 12 + tabBarSpace }}
        scrollIndicatorInsets={{ bottom: tabBarSpace }}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        data={data}
        keyExtractor={quranRowKey}
        renderItem={renderRow}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListHeaderComponent={header}
      />
      <CompactHeroBar hero={hero} visible={compact} overImage={false} />
    </View>
  );
}
