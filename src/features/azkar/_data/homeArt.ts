export const JOURNEY_SPRIG: number = require("@/assets/images/azkar/sprig.webp");

export type WirdArt = { card: number; wide: number };

export const WIRD_ART: Record<string, WirdArt> = {
  morning_azkar: {
    card: require("@/assets/images/azkar/morning.webp"),
    wide: require("@/assets/images/azkar/morning-wide.webp"),
  },
  evening_azkar: {
    card: require("@/assets/images/azkar/evening.webp"),
    wide: require("@/assets/images/azkar/evening-wide.webp"),
  },
};
