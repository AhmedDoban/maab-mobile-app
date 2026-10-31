import AppText from "@/components/ui/AppText";
import BottomSheet from "@/components/ui/BottomSheet";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import SheetHeader from "@/components/ui/SheetHeader";
import { setReciter } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ScrollView, TextInput } from "react-native";
import usePopupColors from "../_components/usePopupColors";
import { RECITERS } from "../_data/reciters";
import { contentLocale } from "@/i18n/config";

export default function ReciterPicker({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation("azkar");
  const c = usePopupColors();
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.reciter);
  const ar = contentLocale(i18n.language) === "ar";
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = q
    ? RECITERS.filter((r) => r.ar.includes(q) || r.en.toLowerCase().includes(q))
    : RECITERS;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closeLabel={t("close")}
      header={
        <SheetHeader
          title={t("chooseReciter")}
          onClose={onClose}
          closeLabel={t("close")}
          className="pb-1"
        />
      }
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t("searchReciter")}
        placeholderTextColor={c.gold}
        className="rounded-2xl border px-4 py-3"
        style={{
          borderColor: c.frame,
          backgroundColor: c.page,
          color: c.ink,
          fontFamily: "LamaSans",
          textAlign: ar ? "right" : "left",
        }}
      />
      <ScrollView
        contentContainerClassName="gap-2 pb-3"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {list.map((reciter) => {
          const selected = reciter.id === current;
          return (
            <PressableScale
              key={reciter.id}
              scaleTo={0.98}
              onPress={() => {
                Haptics.selectionAsync();
                dispatch(setReciter(reciter.id));
                onClose();
              }}
              className="flex-row items-center justify-between rounded-2xl border px-4 py-3"
              style={{
                borderColor: selected ? c.accent : c.frame,
                backgroundColor: selected ? c.highlight : c.page,
              }}
            >
              <AppText weight={selected ? "bold" : "regular"}>
                {ar ? reciter.ar : reciter.en}
              </AppText>
              {selected ? (
                <Icon name="check" size={18} tintColor={c.accent} />
              ) : null}
            </PressableScale>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}
