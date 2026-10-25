import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  TextInput,
  View,
  type TextInputInstance,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import SearchBackdrop from "./SearchBackdrop";
import type { HeroAction, HeroSearch } from "./heroTypes";

export default function HeroSearchField({
  search,
  action,
  size: SIZE = 56,
  plain = false,
}: {
  search: HeroSearch;
  action?: HeroAction;
  size?: number;
  plain?: boolean;
}) {
  const GAP = 10;
  const { t } = useTranslation("common");
  const { isRTL } = useDirection();
  const colors = useThemeColors();
  const tint = plain ? colors.ink : "#ffffff";
  const input = useRef<TextInputInstance>(null);
  const [expanded, setExpanded] = useState(false);
  const open = expanded || search.value.length > 0;
  const [fullWidth, setFullWidth] = useState(0);
  const progress = useSharedValue(open ? 1 : 0);
  const actionEnd = SIZE + GAP;

  useEffect(() => {
    progress.set(
      withTiming(open ? 1 : 0, {
        duration: open ? 340 : 260,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [open, progress]);

  useEffect(() => {
    if (expanded) input.current?.focus();
  }, [expanded]);

  const pill = useAnimatedStyle(() => ({
    width: SIZE + (Math.max(fullWidth, SIZE) - SIZE) * progress.get(),
  }));
  const extra = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.get(),
      [0, 0.35],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.get(),
          [0, 0.35],
          [1, 0.6],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const field = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.get(),
      [0.45, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const close = () => {
    Keyboard.dismiss();
    search.onChangeText("");
    setExpanded(false);
  };

  return (
    <View
      className="flex-1 flex-row justify-end"
      style={{ height: SIZE }}
      onLayout={(e) => setFullWidth(e.nativeEvent.layout.width)}
    >
      {action ? (
        <SearchBackdrop
          size={SIZE}
          plain={plain}
          style={[{ end: actionEnd, width: SIZE }, extra]}
        />
      ) : null}
      <SearchBackdrop size={SIZE} plain={plain} style={pill} />

      {action ? (
        <Animated.View
          className="absolute top-0"
          style={[
            extra,
            {
              end: actionEnd,
              width: SIZE,
              height: SIZE,
              pointerEvents: open ? "none" : "auto",
            },
          ]}
        >
          <PressableScale
            scaleTo={0.88}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="flex-1 items-center justify-center"
          >
            <Icon name={action.icon} size={SIZE * 0.43} tintColor={tint} />
          </PressableScale>
        </Animated.View>
      ) : null}

      <Animated.View
        className="overflow-hidden"
        style={[
          { height: SIZE, borderRadius: SIZE / 2, pointerEvents: "box-none" },
          pill,
        ]}
      >
        <Animated.View
          className="absolute inset-y-0 start-0 flex-row items-center"
          style={[
            field,
            { end: SIZE - 2, pointerEvents: open ? "auto" : "none" },
          ]}
        >
          <PressableScale
            hitSlop={10}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t("clear")}
            className="ps-4 pe-1"
          >
            <Icon name="close" size={SIZE * 0.4} tintColor={tint} />
          </PressableScale>
          <TextInput
            ref={input}
            value={search.value}
            onChangeText={search.onChangeText}
            onSubmitEditing={search.onSubmitEditing}
            placeholder={search.placeholder}
            placeholderTextColor={
              plain ? colors.gray : "rgba(255, 255, 255, 0.75)"
            }
            returnKeyType="search"
            className={cn(
              "h-full flex-1 px-2",
              plain ? "text-ink" : "text-white",
              SIZE < 50 ? "text-base" : "text-lg",
              isRTL ? "font-lama" : "font-space",
            )}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          />
        </Animated.View>

        <PressableScale
          scaleTo={0.88}
          onPress={() => (open ? input.current?.focus() : setExpanded(true))}
          accessibilityRole="button"
          accessibilityLabel={t("search")}
          className="absolute end-0 top-0 items-center justify-center"
          style={{ width: SIZE - 2, height: SIZE - 2 }}
        >
          <Icon name="search" size={SIZE * 0.43} tintColor={tint} />
        </PressableScale>
      </Animated.View>
    </View>
  );
}
