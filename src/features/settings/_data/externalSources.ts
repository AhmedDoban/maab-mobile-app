import type { IconKey } from "@/components/ui/Icon";

export const EXTERNAL_SOURCES = [
  { id: "everyayah", icon: "volume", url: "https://everyayah.com" },
  { id: "dorar", icon: "tabHadith", url: "https://dorar.net" },
  {
    id: "openstreetmap",
    icon: "location",
    url: "https://www.openstreetmap.org",
  },
] as const satisfies readonly { id: string; icon: IconKey; url: string }[];
