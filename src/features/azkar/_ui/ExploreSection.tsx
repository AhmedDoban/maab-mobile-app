import { memo, useCallback, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { categories } from "../_data";
import CategoryGrid from "./CategoryGrid";
import SectionHeader from "./SectionHeader";

const PREVIEW_ROWS = 3;
const others = categories.filter((c) => !c.featured);

export default memo(function ExploreSection() {
  const { t } = useTranslation("azkar");
  const [all, setAll] = useState(false);
  const [, startTransition] = useTransition();
  const toggle = useCallback(
    () => startTransition(() => setAll((v) => !v)),
    [],
  );

  return (
    <View className="gap-3">
      <SectionHeader
        title={t("exploreTitle")}
        subtitle={t("exploreHint")}
        icon="tabAzkar"
        action={{ label: t(all ? "showLess" : "showAll"), onPress: toggle }}
      />
      <CategoryGrid categories={others} rows={all ? undefined : PREVIEW_ROWS} />
    </View>
  );
});
