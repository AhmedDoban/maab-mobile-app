import AppText from "@/components/ui/AppText";
import useThemeColors from "@/hooks/useThemeColors";
import { updateMosque } from "@/store/Slices/MosquesSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { IqamaPrayer } from "@/features/prayer-times/_data/mosques";
import { TextInput, View } from "react-native";
import { memo } from "react";

function IqamaRow({
  mosqueId,
  prayer,
  label,
}: {
  mosqueId: string;
  prayer: IqamaPrayer;
  label: string;
}) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const mosque = useAppSelector((state) =>
    state.mosques.items.find((item) => item.id === mosqueId),
  );
  const setting = mosque?.iqama[prayer];
  if (!mosque || !setting) return null;

  const update = (value: string) => {
    const parsed = Number(value.replace(/[^\d]/g, ""));
    if (!Number.isFinite(parsed)) return;
    dispatch(
      updateMosque({
        ...mosque,
        iqama: {
          ...mosque.iqama,
          [prayer]: { kind: "offset", minutes: Math.min(180, parsed) },
        },
      }),
    );
  };

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-main-bg px-3 py-2">
      <AppText className="flex-1 text-sm">{label}</AppText>
      <TextInput
        value={
          setting.kind === "offset" ? String(setting.minutes) : setting.time
        }
        onChangeText={update}
        keyboardType="number-pad"
        className="w-20 rounded-xl border border-line bg-surface px-2 text-center text-ink"
        style={{ color: colors.ink, height: 40, paddingHorizontal: 8 }}
      />
      <AppText className="text-main-gray">دقيقة بعد الأذان</AppText>
    </View>
  );
}

export default memo(IqamaRow);
