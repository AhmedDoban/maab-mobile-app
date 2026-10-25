import { Fragment } from "react";
import { View } from "react-native";
import usePrayerLabels from "../_components/usePrayerLabels";
import { PrayerCardProps } from "../_data/schedule";
import { shortTime } from "../_data/time";
import NextPrayerSummary from "./NextPrayerSummary";
import PrayerCell from "./PrayerCell";
import PrayerConnector from "./PrayerConnector";
import PrayerCountdownText from "./PrayerCountdownText";
import PrayerDateRow from "./PrayerDateRow";
import ReminderHint from "./ReminderHint";

const MINUTE = 60_000;
const CARD_STYLE = { boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)" };

export default function ModernPrayerCard({
  day,
  prayers,
  next,
  now,
  isFriday,
  city,
  showHint,
  onDenied,
}: PrayerCardProps) {
  const { label } = usePrayerLabels();
  const targetMs =
    Math.floor(now.getTime() / MINUTE) * MINUTE + next.minutesLeft * MINUTE;

  return (
    <View
      className="gap-4 rounded-3xl border border-line bg-surface p-4"
      style={CARD_STYLE}
    >
      <View className="flex-row items-center gap-3">
        <NextPrayerSummary
          label={label(next.name, isFriday)}
          time={shortTime(next.time)}
        />
        <View className="h-12 w-px bg-line" />
        <PrayerCountdownText targetMs={targetMs} />
        <View className="flex-1 items-end">
          <PrayerDateRow hijri={day.hijri} city={city} />
        </View>
      </View>

      <View className="flex-row items-start">
        {prayers.map(({ name, time, status }, index) => (
          <Fragment key={name}>
            {index > 0 ? <PrayerConnector /> : null}
            <PrayerCell
              prayer={name}
              label={label(name, isFriday)}
              time={shortTime(time)}
              status={status}
              onDenied={onDenied}
            />
          </Fragment>
        ))}
      </View>

      {showHint ? <ReminderHint /> : null}
    </View>
  );
}
