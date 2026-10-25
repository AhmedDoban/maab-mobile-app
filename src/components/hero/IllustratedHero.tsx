import AppText from "@/components/ui/AppText";
import ContentColumn from "@/components/ui/ContentColumn";
import { memo, ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeroSearchField from "./HeroSearchField";
import type { HeroAction, HeroSearch } from "./heroTypes";

export default memo(function IllustratedHero({
  title,
  subtitle,
  art,
  leading,
  search,
  action,
}: {
  title: string;
  subtitle?: string;
  art: ReactNode;
  leading?: ReactNode;
  search?: HeroSearch;
  action?: HeroAction;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ContentColumn className="gap-4 px-4">
      <View
        className="min-h-12 flex-row items-center gap-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        {leading ? (
          <View className="absolute bottom-0 start-0 h-12 justify-center">
            {leading}
          </View>
        ) : null}
        {search ? (
          <HeroSearchField search={search} action={action} size={48} plain />
        ) : null}
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1 gap-1.5">
          <AppText
            weight="bold"
            className="text-[32px] leading-[48px] text-main"
          >
            {title}
          </AppText>
          {subtitle ? (
            <AppText className="text-base text-ink">{subtitle}</AppText>
          ) : null}
        </View>
        <View className="w-[42%] self-end">{art}</View>
      </View>
    </ContentColumn>
  );
});
