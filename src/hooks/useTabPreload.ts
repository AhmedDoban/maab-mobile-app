import { router } from "expo-router";
import { useEffect } from "react";

const TAB_ROUTES = ["/quran", "/hadith", "/settings", "/qibla"] as const;

export default function useTabPreload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let index = 0;
    let task = 0;
    const next = () => {
      task = requestIdleCallback(() => {
        router.prefetch(TAB_ROUTES[index]);
        index += 1;
        if (index < TAB_ROUTES.length) next();
      });
    };
    next();
    return () => cancelIdleCallback(task);
  }, [enabled]);
}
