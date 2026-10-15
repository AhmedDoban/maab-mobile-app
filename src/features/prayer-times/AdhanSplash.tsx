import { ALL_ORIENTATIONS } from "@/constants/orientations";
import ThemeScope from "@/components/theme/ThemeScope";
import AppText from "@/components/ui/AppText";
import PressableScale from "@/components/ui/PressableScale";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { useTranslation } from "react-i18next";
import { Modal, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import usePrayerLabels from "./_components/usePrayerLabels";
import { AdhanSoundId } from "./_data/adhanSounds";
import { PrayerName } from "./_data/types";
import AdhanAudio from "./_ui/AdhanAudio";
import AdhanBackdrop from "./_ui/adhan/AdhanBackdrop";
import CrescentDivider from "./_ui/adhan/CrescentDivider";
import Lantern from "./_ui/adhan/Lantern";
import { ADHAN_PALETTE } from "./_data/adhanPalette";

export default function AdhanSplash({
  prayer,
  time,
  sound,
  nativeAudio,
  onClose,
}: {
  prayer: PrayerName | null;
  sound: AdhanSoundId;
  nativeAudio: boolean;
  time?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation("prayer");
  const { isDark } = useThemeColors();
  const { direction } = useDirection();
  const insets = useSafeAreaInsets();
  const { label, formatTime } = usePrayerLabels();
  const p = ADHAN_PALETTE[isDark ? "dark" : "light"];

  return (
    <>
      {prayer && !nativeAudio ? (
        <AdhanAudio key={prayer} sound={sound} onEnd={onClose} />
      ) : null}
      <Modal
        visible={prayer !== null}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        supportedOrientations={ALL_ORIENTATIONS}
        onRequestClose={onClose}
      >
        <ThemeScope>
          {prayer && (
            <View
              className="flex-1"
              style={{ direction, backgroundColor: p.bgBottom }}
            >
              <AdhanBackdrop palette={p} />

              <Lantern palette={p} left={20} length={insets.top + 24} />
              <Lantern
                palette={p}
                left={64}
                length={insets.top + 78}
                size={0.8}
                delay={500}
              />
              <Lantern
                palette={p}
                right={20}
                length={insets.top + 56}
                delay={250}
              />
              <Lantern
                palette={p}
                right={66}
                length={insets.top + 12}
                size={0.75}
                delay={750}
              />

              <Animated.View
                entering={FadeInDown.duration(600)}
                style={{ marginTop: insets.top + 150 }}
              >
                <AppText
                  weight="bold"
                  className="font-hafs text-3xl leading-[48px]"
                  style={{ textAlign: "center", color: p.text }}
                >
                  {t("adhanTime")}
                </AppText>
              </Animated.View>

              <View className="flex-1" />

              <Animated.View
                entering={FadeInDown.delay(250).duration(700)}
                className="items-center gap-4 px-6"
                style={{ paddingBottom: insets.bottom + 28 }}
              >
                <CrescentDivider color={p.text} />
                <AppText
                  weight="bold"
                  className="font-hafs text-5xl leading-[72px]"
                  style={{ textAlign: "center", color: p.text }}
                >
                  {label(prayer)}
                </AppText>
                <AppText
                  className="text-base leading-6"
                  style={{ textAlign: "center", color: p.textMuted }}
                >
                  {time ? `${formatTime(time)} · ` : ""}
                  {t("adhanCall")}
                </AppText>

                <PressableScale
                  onPress={onClose}
                  className="mt-3 w-full flex-row items-center justify-center gap-2 rounded-full py-4"
                  style={{ backgroundColor: p.button }}
                >
                  <AppText
                    weight="bold"
                    className="text-lg"
                    style={{ color: p.buttonText }}
                  >
                    {t("dismiss")}
                  </AppText>
                </PressableScale>
              </Animated.View>
            </View>
          )}
        </ThemeScope>
      </Modal>
    </>
  );
}
