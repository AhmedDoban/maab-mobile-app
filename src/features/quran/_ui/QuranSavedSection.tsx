import EmptyState from "@/components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useHasSavedAyahs from "../_components/useHasSavedAyahs";
import BookmarkCard from "./BookmarkCard";
import SavedAyahs from "./SavedAyahs";

export default function QuranSavedSection() {
  const { t } = useTranslation("azkar");
  const hasSaved = useHasSavedAyahs();

  if (!hasSaved) {
    return (
      <EmptyState
        icon="bookmark"
        title={t("noSaved")}
        hint={t("noSavedHint")}
      />
    );
  }
  return (
    <View className="gap-4">
      <BookmarkCard />
      <SavedAyahs />
    </View>
  );
}
