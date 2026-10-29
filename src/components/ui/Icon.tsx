import AlarmClockIcon from "@hugeicons/core-free-icons/AlarmClockIcon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import ArrowLeft01Icon from "@hugeicons/core-free-icons/ArrowLeft01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import BedSingle02Icon from "@hugeicons/core-free-icons/BedSingle02Icon";
import BookOpen01Icon from "@hugeicons/core-free-icons/BookOpen01Icon";
import Book02Icon from "@hugeicons/core-free-icons/Book02Icon";
import Bookmark02Icon from "@hugeicons/core-free-icons/Bookmark02Icon";
import Calendar03Icon from "@hugeicons/core-free-icons/Calendar03Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import ChartColumnIcon from "@hugeicons/core-free-icons/ChartColumnIcon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import CleanIcon from "@hugeicons/core-free-icons/CleanIcon";
import CloudUploadIcon from "@hugeicons/core-free-icons/CloudUploadIcon";
import Clock01Icon from "@hugeicons/core-free-icons/Clock01Icon";
import Compass01Icon from "@hugeicons/core-free-icons/Compass01Icon";
import Copy01Icon from "@hugeicons/core-free-icons/Copy01Icon";
import Database01Icon from "@hugeicons/core-free-icons/Database01Icon";
import Delete02Icon from "@hugeicons/core-free-icons/Delete02Icon";
import Door01Icon from "@hugeicons/core-free-icons/Door01Icon";
import DuaIcon from "@hugeicons/core-free-icons/DuaIcon";
import Facebook01Icon from "@hugeicons/core-free-icons/Facebook01Icon";
import FavouriteIcon from "@hugeicons/core-free-icons/FavouriteIcon";
import Flight from "@hugeicons/core-free-icons/Airplane01Icon";
import GithubIcon from "@hugeicons/core-free-icons/GithubIcon";
import GlobeIcon from "@hugeicons/core-free-icons/GlobeIcon";
import HajiIcon from "@hugeicons/core-free-icons/HajiIcon";
import HandPrayerIcon from "@hugeicons/core-free-icons/HandPrayerIcon";
import InstagramIcon from "@hugeicons/core-free-icons/InstagramIcon";
import Kaaba01Icon from "@hugeicons/core-free-icons/Kaaba01Icon";
import Kurta01Icon from "@hugeicons/core-free-icons/Kurta01Icon";
import Leaf01Icon from "@hugeicons/core-free-icons/Leaf01Icon";
import Linkedin01Icon from "@hugeicons/core-free-icons/Linkedin01Icon";
import Location01Icon from "@hugeicons/core-free-icons/Location01Icon";
import Moon01Icon from "@hugeicons/core-free-icons/Moon01Icon";
import Moon02Icon from "@hugeicons/core-free-icons/Moon02Icon";
import MoonStarIcon from "@hugeicons/core-free-icons/MoonStarIcon";
import Mosque02Icon from "@hugeicons/core-free-icons/Mosque02Icon";
import MuhammadIcon from "@hugeicons/core-free-icons/MuhammadIcon";
import Notification03Icon from "@hugeicons/core-free-icons/Notification03Icon";
import NotificationOff03Icon from "@hugeicons/core-free-icons/NotificationOff03Icon";
import OrganicFoodIcon from "@hugeicons/core-free-icons/OrganicFoodIcon";
import PaintBoardIcon from "@hugeicons/core-free-icons/PaintBoardIcon";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import PrayerRug01Icon from "@hugeicons/core-free-icons/PrayerRug01Icon";
import PrayerRug02Icon from "@hugeicons/core-free-icons/PrayerRug02Icon";
import QuoteUpIcon from "@hugeicons/core-free-icons/QuoteUpIcon";
import Quran01Icon from "@hugeicons/core-free-icons/Quran01Icon";
import Quran02Icon from "@hugeicons/core-free-icons/Quran02Icon";
import RefreshIcon from "@hugeicons/core-free-icons/RefreshIcon";
import ReminderIcon from "@hugeicons/core-free-icons/ReminderIcon";
import RukuIcon from "@hugeicons/core-free-icons/RukuIcon";
import SalahIcon from "@hugeicons/core-free-icons/SalahIcon";
import SalahTimeIcon from "@hugeicons/core-free-icons/SalahTimeIcon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Settings02Icon from "@hugeicons/core-free-icons/Settings02Icon";
import Share08Icon from "@hugeicons/core-free-icons/Share08Icon";
import SmartPhone01Icon from "@hugeicons/core-free-icons/SmartPhone01Icon";
import SoapDispenserDropletIcon from "@hugeicons/core-free-icons/SoapDispenserDropletIcon";
import StopIcon from "@hugeicons/core-free-icons/StopIcon";
import SujoodIcon from "@hugeicons/core-free-icons/SujoodIcon";
import Sun03Icon from "@hugeicons/core-free-icons/Sun03Icon";
import SunCloud02Icon from "@hugeicons/core-free-icons/SunCloud02Icon";
import SunriseIcon from "@hugeicons/core-free-icons/SunriseIcon";
import SunsetIcon from "@hugeicons/core-free-icons/SunsetIcon";
import TasbihIcon from "@hugeicons/core-free-icons/TasbihIcon";
import TaskDailyFreeIcons from "@hugeicons/core-free-icons/TaskDaily01Icon";
import TentTreeIcon from "@hugeicons/core-free-icons/TentTreeIcon";
import TextFontIcon from "@hugeicons/core-free-icons/TextFontIcon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";
import TranslateIcon from "@hugeicons/core-free-icons/TranslateIcon";
import UndoIcon from "@hugeicons/core-free-icons/UndoIcon";
import UserLove02Icon from "@hugeicons/core-free-icons/UserLove02Icon";
import VolumeHighIcon from "@hugeicons/core-free-icons/VolumeHighIcon";
import VomitingIcon from "@hugeicons/core-free-icons/VomitingIcon";
import WhatsappIcon from "@hugeicons/core-free-icons/WhatsappIcon";
import WifiOff02Icon from "@hugeicons/core-free-icons/WifiOff02Icon";
import WuduIcon from "@hugeicons/core-free-icons/WuduIcon";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import type { ColorValue } from "react-native";
import QuranCoverIcon from "./QuranCoverIcon";

const filled = (icon: IconSvgElement): IconSvgElement =>
  icon.map(
    ([tag, attrs]) => [tag, { ...attrs, fill: "currentColor" }] as const,
  );

const BrandMarkIcon: IconSvgElement = [
  [
    "path",
    {
      d: "M12 2.5 15 6l4.5-.5L19 10l3.5 2-3.5 2 .5 4.5L15 18l-3 3.5L9 18l-4.5.5L5 14l-3.5-2L5 10l-.5-4.5L9 6Z",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0",
    },
  ],
  [
    "circle",
    {
      cx: "12",
      cy: "12",
      r: "2.5",
      stroke: "currentColor",
      strokeWidth: "1.5",
      key: "1",
    },
  ],
];

const Icons = {
  arrowUpForward: ArrowUpRight01Icon,
  asr: SunCloud02Icon,
  bell: Notification03Icon,
  bellSlash: NotificationOff03Icon,
  book: Book02Icon,
  bookOpen: BookOpen01Icon,
  bookmark: Bookmark02Icon,
  bookmarkFill: filled(Bookmark02Icon),
  brandMark: BrandMarkIcon,
  calendar: Calendar03Icon,
  chart: ChartColumnIcon,
  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  chevronDown: ArrowDown01Icon,
  chevronLeft: ArrowLeft01Icon,
  chevronRight: ArrowRight01Icon,
  clearCache: CleanIcon,
  clock: Clock01Icon,
  compass: Compass01Icon,
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
  leaf: Leaf01Icon,
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
  prayer: PrayerRug02Icon,
  sleep: BedSingle02Icon,
  muhammad: MuhammadIcon,
  wakeUp: AlarmClockIcon,
  azan: SalahTimeIcon,
  wudu: WuduIcon,
  mosque: Mosque02Icon,
  haji: HajiIcon,
  clothes: Kurta01Icon,
  salah: SalahIcon,
  sujood: SujoodIcon,
  ruku: RukuIcon,
  pray: HandPrayerIcon,
  dua: DuaIcon,
  homeEnter: Door01Icon,
  khala: SoapDispenserDropletIcon,
  food: OrganicFoodIcon,
  sick: VomitingIcon,
  quran1: Quran01Icon,
  nature: TentTreeIcon,
  dailyLife: TaskDailyFreeIcons,
  flight: Flight,
  marriage: UserLove02Icon,
  moonStar: MoonStarIcon,
  reminderIcon: ReminderIcon,
} satisfies Record<string, IconSvgElement>;

export type IconKey = keyof typeof Icons;

export default function Icon({
  name,
  size = 20,
  tintColor,
  strokeWidth = 1.3,
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
