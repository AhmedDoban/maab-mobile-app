import { useMemo } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import AppText from "@/components/ui/AppText";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import SectionTitle from "@/components/ui/SectionTitle";
import useThemeColors from "@/hooks/useThemeColors";
import { useSearchHadithQuery } from "@/store/Slices/DorarSlice";
import { hasArabic, searchLocalHadiths } from "../_data";
import DorarHadithCard from "./DorarHadithCard";
import LocalHadithCard from "./LocalHadithCard";
import HadithCardSkeleton from "./HadithCardSkeleton";

const MAX_LOCAL = 30;

export default function HadithSearchResults({ query }: { query: string }) {
  const { t, i18n } = useTranslation("hadith");
  const colors = useThemeColors();
  const useDorar = i18n.language === "ar" && hasArabic(query);

  const { data, isFetching, isError } = useSearchHadithQuery(query, {
    skip: !useDorar,
  });
  const showLocal = !useDorar || isError;
  const local = useMemo(
    () => (showLocal ? searchLocalHadiths(query).slice(0, MAX_LOCAL) : []),
    [query, showLocal],
  );

  if (useDorar && isFetching) {
    return (
      <View className="gap-3">
        <SectionTitle title={t("dorarResults")} />
        <HadithCardSkeleton />
        <HadithCardSkeleton />
        <HadithCardSkeleton />
      </View>
    );
  }

  if (useDorar && !isError && data) {
    return data.length === 0 ? (
      <EmptyState icon="search" title={t("noResults")} />
    ) : (
      <View className="gap-3">
        <SectionTitle title={t("dorarResults")} />
        {data.map((hadith) => (
          <DorarHadithCard key={hadith.id} hadith={hadith} />
        ))}
      </View>
    );
  }

  return (
    <View className="gap-3">
      {useDorar && isError && (
        <View className="flex-row items-center gap-3 rounded-2xl bg-main-orange-soft p-4">
          <Icon name="wifiOff" size={18} tintColor={colors.orange} />
          <AppText className="flex-1 text-sm text-main-orange">
            {t("dorarError")}
          </AppText>
        </View>
      )}
      {local.length === 0 ? (
        <EmptyState icon="search" title={t("noResults")} />
      ) : (
        <>
          <SectionTitle title={t("offlineResults")} />
          {local.map((hadith) => (
            <LocalHadithCard key={hadith.id} hadith={hadith} />
          ))}
        </>
      )}
    </View>
  );
}
