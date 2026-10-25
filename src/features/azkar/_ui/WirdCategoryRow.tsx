import { Locale } from "@/i18n/config";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import useCategoryProgress from "../_components/useCategoryProgress";
import { AzkarCategory } from "../_data";
import WirdRowCard from "./WirdRowCard";

export default memo(function WirdCategoryRow({
  category,
}: {
  category: AzkarCategory;
}) {
  const { t, i18n } = useTranslation("azkar");
  const { done, total, complete } = useCategoryProgress(category);

  return (
    <WirdRowCard
      href={`/category/${category.id}`}
      icon={category.icon ?? "tabAzkar"}
      title={category.title[i18n.language as Locale]}
      subtitle={
        complete ? t("done") : t("progressCount", { done, count: total })
      }
      progress={total ? done / total : 0}
    />
  );
});
