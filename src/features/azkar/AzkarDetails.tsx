import { useTranslation } from "react-i18next";
import Screen from "@/components/ui/Screen";
import EmptyState from "@/components/ui/EmptyState";
import { contentLocale } from "@/i18n/config";
import { getCategory } from "./_data";
import CategoryContent from "./_ui/CategoryContent";
import { incrementCount } from "@/store/Slices/AzkarSlice";
import { useAppDispatch } from "@/store/Store";
import { useEffect, useRef } from "react";

export default function AzkarDetails({
  id,
  widgetItem,
  widgetMax,
}: {
  id: string;
  widgetItem?: string;
  widgetMax?: string;
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const appliedWidgetRead = useRef(false);
  const category = getCategory(id);

  useEffect(() => {
    if (appliedWidgetRead.current || !widgetItem || !widgetMax) return;
    const itemId = Number(widgetItem);
    const max = Number(widgetMax);
    if (
      Number.isInteger(itemId) &&
      Number.isInteger(max) &&
      itemId > 0 &&
      max > 0
    ) {
      appliedWidgetRead.current = true;
      dispatch(incrementCount({ categoryId: id, itemId, max }));
    }
  }, [dispatch, id, widgetItem, widgetMax]);

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
