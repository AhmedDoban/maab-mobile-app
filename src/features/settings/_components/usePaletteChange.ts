import { PaletteId } from "@/constants/palettes";
import { savePersistedState } from "@/store/persist";
import { setPalette } from "@/store/Slices/SettingsSlice";
import { Store, useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

const SHOW_DELAY = 120;
const MIN_DURATION = 1200;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const afterInteractions = () =>
  new Promise<void>((resolve) => requestIdleCallback(() => resolve()));

export default function usePaletteChange() {
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.palette);
  const [applying, setApplying] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const change = useCallback(
    async (id: PaletteId) => {
      if (busy.current || id === current) return;
      busy.current = true;
      Haptics.selectionAsync();
      setApplying(true);
      const started = Date.now();
      await wait(SHOW_DELAY);
      dispatch(setPalette(id));
      await afterInteractions();
      await savePersistedState(Store.getState());
      await wait(Math.max(0, MIN_DURATION - (Date.now() - started)));
      busy.current = false;
      if (mounted.current) setApplying(false);
    },
    [current, dispatch],
  );

  return { current, applying, change };
}
