import { PropsWithChildren, useMemo } from "react";
import RecitationContext from "./RecitationContext";
import useRecitation from "./useRecitation";

export default function RecitationProvider({ children }: PropsWithChildren) {
  const {
    current,
    playing,
    loading,
    offline,
    dismissOffline,
    play,
    pause,
    resume,
    stop,
  } = useRecitation();
  const value = useMemo(
    () => ({
      current,
      playing,
      loading,
      offline,
      dismissOffline,
      play,
      pause,
      resume,
      stop,
    }),
    [
      current,
      playing,
      loading,
      offline,
      dismissOffline,
      play,
      pause,
      resume,
      stop,
    ],
  );
  return (
    <RecitationContext.Provider value={value}>
      {children}
    </RecitationContext.Provider>
  );
}
