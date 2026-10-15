import type { EventArg, NavigationAction } from "expo-router/react-navigation";
import { useCallback, useRef } from "react";

const SETTLE_FALLBACK_MS = 700;

type Navigation = { dispatch: (action: NavigationAction) => void };
type RemoveEvent = EventArg<"beforeRemove", true, { action: NavigationAction }>;
type TransitionEvent = EventArg<"transitionEnd", false, { closing: boolean }>;

export default function useTransitionGuard() {
  const settled = useRef(new Set<string>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const queued = useRef(new Map<string, NavigationAction>());

  return useCallback(
    ({
      navigation,
      route,
    }: {
      navigation: Navigation;
      route: { key: string };
    }) => {
      const settle = () => {
        clearTimeout(timers.current.get(route.key));
        timers.current.delete(route.key);
        settled.current.add(route.key);
        const action = queued.current.get(route.key);
        if (!action) return;
        queued.current.delete(route.key);
        navigation.dispatch(action);
      };

      const scheduleFallback = () => {
        if (settled.current.has(route.key) || timers.current.has(route.key)) {
          return;
        }
        timers.current.set(route.key, setTimeout(settle, SETTLE_FALLBACK_MS));
      };

      return {
        focus: scheduleFallback,
        transitionEnd: (e: TransitionEvent) => {
          if (!e.data.closing) settle();
        },
        beforeRemove: (e: RemoveEvent) => {
          if (settled.current.has(route.key)) {
            settled.current.delete(route.key);
            return;
          }
          e.preventDefault();
          queued.current.set(route.key, e.data.action);
          scheduleFallback();
        },
      };
    },
    [],
  );
}
