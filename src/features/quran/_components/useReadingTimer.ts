import { addQuranReadingTime } from "@/store/Slices/SettingsSlice";
import { useAppDispatch } from "@/store/Store";
import { useEffect } from "react";
import { AppState } from "react-native";

const MAX_SESSION_S = 2 * 60 * 60;

export default function useReadingTimer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let start: number | null = Date.now();

    const flush = () => {
      if (start === null) return;
      const seconds = Math.min(
        MAX_SESSION_S,
        Math.round((Date.now() - start) / 1000),
      );
      start = null;
      if (seconds > 0) dispatch(addQuranReadingTime(seconds));
    };

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") start ??= Date.now();
      else flush();
    });

    return () => {
      sub.remove();
      flush();
    };
  }, [dispatch]);
}
