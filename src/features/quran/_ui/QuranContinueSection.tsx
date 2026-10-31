import { View } from "react-native";
import useContinueReading from "../_components/useContinueReading";
import KhatmaWirdCard from "./KhatmaWirdCard";
import ReadingProgressCard from "./ReadingProgressCard";

export default function QuranContinueSection() {
  const { wird, last, marked } = useContinueReading();
  const spot = last ?? marked;
  if (!wird && !spot) return null;

  return (
    <View className="gap-3">
      {wird ? <KhatmaWirdCard plan={wird} /> : null}
      {spot ? (
        <ReadingProgressCard spot={spot} bookmark={last ? marked : null} />
      ) : null}
    </View>
  );
}
