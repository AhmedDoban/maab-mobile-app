import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { getPage } from "@/features/azkar/_data/quran";
import ResetDialog from "@/features/settings/_ui/ResetDialog";
import {
  completeWird,
  endKhatma,
  undoWird,
  type KhatmaPlan,
} from "@/store/Slices/SettingsSlice";
import { useAppDispatch } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useDueLabel from "../_components/useDueLabel";
import useLocalDigits from "../_components/useLocalDigits";
import { khatmaWirds, scheduledDay, wirdLabel } from "../_data/khatma";
import KhatmaCard from "./KhatmaCard";
import KhatmaDone from "./KhatmaDone";
import { contentLocale } from "@/i18n/config";

export default function KhatmaProgress({ plan }: { plan: KhatmaPlan }) {
  const { t, i18n } = useTranslation("azkar");
  const dispatch = useAppDispatch();
  const ar = contentLocale(i18n.language) === "ar";
  const num = useLocalDigits();

  const wirds = khatmaWirds(plan);
  const total = wirds.length;
  const finished = plan.done >= total;
  const today = wirds[Math.min(plan.done, total - 1)];
  const next = wirds[plan.done + 1];
  const expected = scheduledDay(plan);
  const behind = Math.max(0, expected - 1 - plan.done);
  const progress = plan.done / total;
  const due = useDueLabel(plan);
  const current = due(plan.done);
  const upcomingDue = due(plan.done + 1);

  const [confirming, setConfirming] = useState(false);
  const ended = useRef(false);

  const scopeLabel =
    plan.fromJuz === 1 && plan.toJuz === 30
      ? t("khatmaWhole")
      : t("khatmaJuzScope", { from: num(plan.fromJuz), to: num(plan.toJuz) });

  if (finished) return <KhatmaDone scopeLabel={scopeLabel} />;

  const label = wirdLabel(today.from, today.to, ar);
  const upcoming = next ? wirdLabel(next.from, next.to, ar) : null;

  return (
    <View className="gap-4">
      <KhatmaCard>
        <View className="flex-row items-center justify-between">
          <AppText weight="bold" className="text-xl">
            {t("khatmaDay", { day: num(plan.done + 1), days: num(total) })}
          </AppText>
          <AppText className="text-sm text-main-gray">{scopeLabel}</AppText>
        </View>
        <View className="h-2.5 overflow-hidden rounded-full bg-main-soft">
          <View
            className="h-full rounded-full bg-main-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
        <AppText className="text-sm text-main-gray">
          {behind > 0
            ? t("khatmaBehind", { count: behind, days: num(behind) })
            : t("khatmaOnTrack")}
        </AppText>
      </KhatmaCard>

      <KhatmaCard>
        <AppText weight="bold" className="text-lg">
          {current.title}
        </AppText>
        <View className="gap-1">
          <AppText className="text-sm text-main-gray">{current.date}</AppText>
          <AppText weight="bold" className="text-main">
            {t("khatmaPages", { from: num(today.from), to: num(today.to) })}
          </AppText>
          <AppText className="text-main-gray">
            {t("khatmaRange", { start: label.start, end: label.end })}
          </AppText>
        </View>
        <View className="flex-row gap-3">
          <Link
            href={{
              pathname: "/mushaf/[id]",
              params: { id: getPage(today.from).start.surah, page: today.from },
            }}
            asChild
          >
            <PressableScale className="flex-1 items-center rounded-full border border-main py-3.5">
              <AppText weight="bold" className="text-main">
                {t("khatmaRead")}
              </AppText>
            </PressableScale>
          </Link>
          <PressableScale
            onPress={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              dispatch(completeWird());
            }}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-main-fill py-3.5"
          >
            <Icon name="check" size={18} tintColor="#ffffff" />
            <AppText weight="bold" className="text-on-fill">
              {t("khatmaMarkDone")}
            </AppText>
          </PressableScale>
        </View>
      </KhatmaCard>

      {upcoming && next ? (
        <View className="gap-1 rounded-3xl border border-line px-5 py-4">
          <AppText weight="bold" className="text-main-gray">
            {`${upcomingDue.title} · ${upcomingDue.date}`}
          </AppText>
          <AppText className="text-main-gray">
            {`${t("khatmaPages", { from: num(next.from), to: num(next.to) })} · ${t(
              "khatmaRange",
              { start: upcoming.start, end: upcoming.end },
            )}`}
          </AppText>
        </View>
      ) : null}

      <View className="flex-row justify-between">
        {plan.done > 0 ? (
          <PressableScale
            onPress={() => dispatch(undoWird())}
            hitSlop={8}
            className="px-3 py-2.5"
          >
            <AppText className="text-main-gray">{t("khatmaUndo")}</AppText>
          </PressableScale>
        ) : (
          <View />
        )}
        <PressableScale
          onPress={() => setConfirming(true)}
          hitSlop={8}
          className="px-3 py-2.5"
        >
          <AppText className="text-error">{t("khatmaEnd")}</AppText>
        </PressableScale>
      </View>

      <ResetDialog
        content={
          confirming
            ? {
                icon: "resetAll",
                title: t("khatmaEndTitle"),
                message: t("khatmaEndMessage"),
                confirmLabel: t("khatmaEnd"),
                doneText: t("khatmaEnded"),
                danger: true,
                onConfirm: () => {
                  ended.current = true;
                },
              }
            : null
        }
        onClose={() => {
          setConfirming(false);
          if (ended.current) {
            ended.current = false;
            dispatch(endKhatma());
          }
        }}
      />
    </View>
  );
}
