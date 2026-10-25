import { usePreventRemove } from "expo-router";
import { useEffect, useRef, useState } from "react";

const SETTLE_FALLBACK_MS = 700;

type TransitionEvents = {
  addListener: (
    type: "transitionEnd",
    callback: (event: { data: { closing: boolean } }) => void,
  ) => () => void;
};

export default function useTransitionGuard(navigation: TransitionEvents) {
  const [settled, setSettled] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const settle = () => setSettled(true);
    const timer = setTimeout(settle, SETTLE_FALLBACK_MS);
    const unsubscribe = navigation.addListener("transitionEnd", (event) => {
      if (!event.data.closing) settle();
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [navigation]);

  usePreventRemove(!settled, ({ repeat }) => {
    pending.current = repeat;
  });

  useEffect(() => {
    if (!settled || !pending.current) return;
    const repeat = pending.current;
    pending.current = null;
    repeat();
  }, [settled]);
}
