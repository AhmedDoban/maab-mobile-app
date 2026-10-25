import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Skeleton from "@/components/ui/Skeleton";
import { REMINDER_PRAYERS } from "../_data/types";

export default function PrayerTimesCardSkeleton() {
  const { t } = useTranslation("common");

  return (
    <View
      accessibilityLabel={t("loading")}
      className="gap-4 rounded-3xl border border-line bg-surface p-4"
    >
      <View className="flex-row items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <View className="gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-7 w-20" />
        </View>
        <View className="flex-1 items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </View>
        <View className="gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </View>
      </View>
      <View className="flex-row gap-3">
        {REMINDER_PRAYERS.map((name) => (
          <Skeleton key={name} className="h-20 flex-1 rounded-2xl" />
        ))}
      </View>
    </View>
  );
}
