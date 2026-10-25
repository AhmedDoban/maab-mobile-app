import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Link } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useCategoryProgress from "../_components/useCategoryProgress";
import { AzkarCategory } from "../_data";
import ProgressRing from "./ProgressRing";

export default memo(function CategoryTile({
  category,
  showProgress = true,
}: {
  category: AzkarCategory;
  showProgress?: boolean;
}) {
  const { t, i18n } = useTranslation("azkar");
  const colors = useThemeColors();
  const { isRTL } = useDirection();
  const { done, total, complete } = useCategoryProgress(category);
  const finished = showProgress && complete;

  return (
    <Link href={`/category/${category.id}`} asChild>
      <PressableScale className="min-h-[72px] flex-row items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-3">
        <Icon
          name={category.icon ?? "tabAzkar"}
          size={24}
          tintColor={colors.main}
        />
        <View className="flex-1 gap-0.5">
          <AppText
            weight="bold"
            className="text-sm leading-5 text-ink"
            numberOfLines={2}
          >
            {category.title[i18n.language as Locale]}
          </AppText>
          <AppText
            weight={finished ? "bold" : "regular"}
            className={cn("text-xs", finished ? "text-main" : "text-main-gray")}
          >
            {!showProgress
              ? t("itemsCount", { count: total })
              : complete
                ? t("done")
                : t("progress", { done, total })}
          </AppText>
        </View>
        {showProgress ? (
          <ProgressRing
            progress={total ? done / total : 0}
            color={complete ? colors.mainFill : colors.main}
            checkColor={colors.onFill}
            track={colors.line}
            size={38}
          />
        ) : (
          <Icon
            name={isRTL ? "chevronLeft" : "chevronRight"}
            size={14}
            tintColor={colors.gray}
          />
        )}
      </PressableScale>
    </Link>
  );
});
