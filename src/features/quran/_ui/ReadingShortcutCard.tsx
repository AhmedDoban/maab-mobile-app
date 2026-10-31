import AppText from "@/components/ui/AppText";
import Icon, { IconKey } from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { Link } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { contentLocale } from "@/i18n/config";

type Props = {
  icon: IconKey;
  title: string;
  subtitle: string;
  surah: number;
  ayah?: number;
  page?: number;
};

export default memo(function ReadingShortcutCard({
  icon,
  title,
  subtitle,
  surah,
  ayah,
  page,
}: Props) {
  const { i18n } = useTranslation();
  const ar = contentLocale(i18n.language) === "ar";

  return (
    <Link
      href={{
        pathname: "/mushaf/[id]",
        params: page ? { id: surah, page } : { id: surah, ayah: ayah ?? 1 },
      }}
      asChild
    >
      <PressableScale
        scaleTo={0.98}
        className="flex-row items-center gap-3 rounded-2xl bg-main-fill px-5 py-4"
      >
        <Icon name={icon} size={24} tintColor="#ffffff" />
        <View className="flex-1">
          <AppText weight="bold" className="text-on-fill">
            {title}
          </AppText>
          <AppText className="text-sm text-on-fill">{subtitle}</AppText>
        </View>
        <Icon
          name={ar ? "chevronLeft" : "chevronRight"}
          size={20}
          tintColor="#ffffff"
        />
      </PressableScale>
    </Link>
  );
});
