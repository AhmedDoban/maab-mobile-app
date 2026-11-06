import AppText from "@/components/ui/AppText";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function CategoryCompletedBanner() {
  const { t } = useTranslation("azkar");

  return (
    <View className="w-full max-w-3xl self-center px-4">
      <View className="rounded-3xl bg-main-soft p-4">
        <AppText
          weight="bold"
          className="text-main"
          style={{ textAlign: "center" }}
        >
          {t("completed")}
        </AppText>
      </View>
    </View>
  );
}
