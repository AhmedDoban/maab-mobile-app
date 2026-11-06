import { PropsWithChildren, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Store } from "@/store/Store";
import { hydrateAzkar, hydrateSettings, loadPersistedState } from "./persist";
import { hydrateMosques } from "./Slices/MosquesSlice";

const hydration = loadPersistedState().then(({ settings, azkar, mosques }) => {
  if (settings) Store.dispatch(hydrateSettings(settings));
  if (azkar) Store.dispatch(hydrateAzkar(azkar));
  if (mosques) Store.dispatch(hydrateMosques(mosques));
});

type Props = PropsWithChildren<{ onReady?: () => void }>;

function StoreProvider({ children, onReady }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydration.then(() => {
      setReady(true);
      onReady?.();
    });
  }, [onReady]);

  return <Provider store={Store}>{ready ? children : null}</Provider>;
}
export default StoreProvider;
