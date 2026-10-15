import { ALL_ORIENTATIONS } from "@/constants/orientations";
import useSettingsColors from "@/features/settings/_components/useSettingsColors";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

const BACKDROP = [
  StyleSheet.absoluteFill,
  { backgroundColor: "rgba(0,0,0,0.5)" },
];

export default function Dialog({
  visible,
  onClose,
  closeLabel,
  dismissible = true,
  className = "px-8",
  cardClassName = "max-w-sm items-center p-6",
  children,
}: {
  visible: boolean;
  onClose: () => void;
  closeLabel?: string;
  dismissible?: boolean;
  className?: string;
  cardClassName?: string;
  children: ReactNode;
}) {
  const palette = useSettingsColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={ALL_ORIENTATIONS}
      onRequestClose={onClose}
    >
      <View className={cn("flex-1 items-center justify-center", className)}>
        <Pressable
          style={BACKDROP}
          onPress={dismissible ? onClose : undefined}
          accessibilityLabel={closeLabel}
        />
        <View
          className={cn("w-full gap-4 rounded-3xl border", cardClassName)}
          style={{ backgroundColor: palette.card, borderColor: palette.border }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
