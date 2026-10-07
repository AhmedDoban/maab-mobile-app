import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Book02Icon,
  Bookmark02Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CleanIcon,
  CloudUploadIcon,
  Copy01Icon,
  Database01Icon,
  Delete02Icon,
  Facebook01Icon,
  FavouriteIcon,
  GithubIcon,
  GlobeIcon,
  InstagramIcon,
  Kaaba01Icon,
  Linkedin01Icon,
  Location01Icon,
  Moon01Icon,
  Moon02Icon,
  Notification03Icon,
  NotificationOff03Icon,
  PaintBoardIcon,
  PauseIcon,
  PlayIcon,
  PrayerRug01Icon,
  QuoteUpIcon,
  Quran02Icon,
  RefreshIcon,
  Search01Icon,
  Settings02Icon,
  Share08Icon,
  UndoIcon,
  SmartPhone01Icon,
  StopIcon,
  Sun03Icon,
  SunCloud02Icon,
  SunriseIcon,
  SunsetIcon,
  TasbihIcon,
  TextFontIcon,
  Tick02Icon,
  TranslateIcon,
  VolumeHighIcon,
  WhatsappIcon,
  WifiOff02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import type { ColorValue } from "react-native";
import QuranCoverIcon from "./QuranCoverIcon";

const filled = (icon: IconSvgElement): IconSvgElement =>
  icon.map(
    ([tag, attrs]) => [tag, { ...attrs, fill: "currentColor" }] as const,
  );

const Icons = {
  arrowUpForward: ArrowUpRight01Icon,
  asr: SunCloud02Icon,
  bell: Notification03Icon,
  bellSlash: NotificationOff03Icon,
  book: Book02Icon,
  bookmark: Bookmark02Icon,
  bookmarkFill: filled(Bookmark02Icon),
  calendar: Calendar03Icon,
  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  chevronDown: ArrowDown01Icon,
  chevronLeft: ArrowLeft01Icon,
  chevronRight: ArrowRight01Icon,
  clearCache: CleanIcon,
  close: Cancel01Icon,
  copy: Copy01Icon,
  data: Database01Icon,
  dhuhr: Sun03Icon,
  facebook: Facebook01Icon,
  fajr: Moon01Icon,
  github: GithubIcon,
  heart: FavouriteIcon,
  heartFill: filled(FavouriteIcon),
  instagram: InstagramIcon,
  isha: Moon02Icon,
  kaaba: Kaaba01Icon,
  linkedin: Linkedin01Icon,
  location: Location01Icon,
  maghrib: SunsetIcon,
  paint: PaintBoardIcon,
  pause: PauseIcon,
  personPraying: PrayerRug01Icon,
  play: PlayIcon,
  quote: QuoteUpIcon,
  quran: Quran02Icon,
  reset: RefreshIcon,
  resetAll: Delete02Icon,
  resetSettings: UndoIcon,
  search: Search01Icon,
  share: Share08Icon,
  stop: StopIcon,
  sunrise: SunriseIcon,
  tabAzkar: TasbihIcon,
  textFont: TextFontIcon,
  translate: TranslateIcon,
  tabHadith: Book02Icon,
  tabQibla: Kaaba01Icon,
  tabQuran: Quran02Icon,
  tabSettings: Settings02Icon,
  themeDark: Moon02Icon,
  themeLight: Sun03Icon,
  themeSystem: SmartPhone01Icon,
  upload: CloudUploadIcon,
  volume: VolumeHighIcon,
  website: GlobeIcon,
  whatsapp: WhatsappIcon,
  wifiOff: WifiOff02Icon,
} satisfies Record<string, IconSvgElement>;

export type IconKey = keyof typeof Icons;

export default function Icon({
  name,
  size = 20,
  tintColor,
  strokeWidth = 1.7,
}: {
  name: IconKey;
  size?: number;
  tintColor?: ColorValue;
  strokeWidth?: number;
}) {
  if (name === "tabQuran" || name === "quran") {
    return (
      <QuranCoverIcon size={size} color={tintColor} strokeWidth={strokeWidth} />
    );
  }

  return (
    <HugeiconsIcon
      icon={Icons[name]}
      size={size}
      color={tintColor as string | undefined}
      strokeWidth={strokeWidth}
    />
  );
}
