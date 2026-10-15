import type { ImageSourcePropType } from "react-native";
import { DEFAULT_PALETTE, PALETTE_IDS, PaletteId } from "./palettes";

export const APP_ICONS: Record<PaletteId, ImageSourcePropType> = {
  emerald: require("@/assets/images/app-icons/thumbs/emerald.png"),
  teal: require("@/assets/images/app-icons/thumbs/teal.png"),
  ocean: require("@/assets/images/app-icons/thumbs/ocean.png"),
  indigo: require("@/assets/images/app-icons/thumbs/indigo.png"),
  violet: require("@/assets/images/app-icons/thumbs/violet.png"),
  rose: require("@/assets/images/app-icons/thumbs/rose.png"),
  ruby: require("@/assets/images/app-icons/thumbs/ruby.png"),
  amber: require("@/assets/images/app-icons/thumbs/amber.png"),
  olive: require("@/assets/images/app-icons/thumbs/olive.png"),
  slate: require("@/assets/images/app-icons/thumbs/slate.png"),
};

export const iconAlias = (id: PaletteId) => id[0].toUpperCase() + id.slice(1);

export const ICON_ALIASES = [
  iconAlias(DEFAULT_PALETTE),
  ...PALETTE_IDS.filter((id) => id !== DEFAULT_PALETTE).map(iconAlias),
];

export const appIconName = (id: PaletteId) =>
  id === DEFAULT_PALETTE ? null : iconAlias(id);
