import { useSyncExternalStore } from "react";

const SECOND = 1000;

const listeners = new Set<() => void>();
let nowMs = Date.now();
let timer: ReturnType<typeof setTimeout> | undefined;

const tick = () => {
  nowMs = Date.now();
  listeners.forEach((listener) => listener());
  timer = setTimeout(tick, SECOND - (Date.now() % SECOND));
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    nowMs = Date.now();
    timer = setTimeout(tick, SECOND - (nowMs % SECOND));
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
}

export default function useSecondsUntil(targetMs: number) {
  return useSyncExternalStore(subscribe, () =>
    Math.max(0, Math.ceil((targetMs - nowMs) / SECOND)),
  );
}
