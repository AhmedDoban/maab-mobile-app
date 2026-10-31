import { useTranslation } from "react-i18next";
import Screen from "@/components/ui/Screen";
import EmptyState from "@/components/ui/EmptyState";
import { contentLocale } from "@/i18n/config";
import { getCategory } from "./_data";
import CategoryContent from "./_ui/CategoryContent";

export default function AzkarDetails({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const category = getCategory(id);

  if (!category) {
    return (
      <Screen>
        <EmptyState icon="book" title={t("somethingWrong")} />
      </Screen>
    );
  }

  return (
    <CategoryContent
      key={category.id}
      categoryId={category.id}
      title={category.title[contentLocale(i18n.language)]}
    />
  );
}
