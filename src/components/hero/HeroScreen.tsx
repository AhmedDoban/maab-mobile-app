import ContentColumn from "@/components/ui/ContentColumn";
import useCompactHero from "@/hooks/useCompactHero";
import useDirection from "@/hooks/useDirection";
import useTabBarSpace from "@/hooks/useTabBarSpace";
import { PropsWithChildren } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import CompactHeroBar from "./CompactHeroBar";
import PageHero, { HERO_HEIGHT, PageHeroProps } from "./PageHero";

export default function HeroScreen({
  hero,
  children,
}: PropsWithChildren<{ hero: PageHeroProps }>) {
  const tabBarSpace = useTabBarSpace();
  const { direction } = useDirection();
  const { compact, onScroll } = useCompactHero(hero.height ?? HERO_HEIGHT);

  return (
    <View className="flex-1 bg-main-bg">
      <Animated.ScrollView
        className="flex-1 bg-main-bg"
        style={{ direction }}
        contentContainerStyle={{ paddingBottom: 12 + tabBarSpace }}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollIndicatorInsets={{ bottom: tabBarSpace }}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <PageHero {...hero} />
        <ContentColumn className="gap-6 px-4 pt-2">{children}</ContentColumn>
      </Animated.ScrollView>
      <CompactHeroBar hero={hero} visible={compact} />
    </View>
  );
}
