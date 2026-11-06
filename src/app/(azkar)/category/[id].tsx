import { useLocalSearchParams } from "expo-router";
import AzkarDetails from "@/features/azkar/AzkarDetails";

export default function CategoryPage() {
  const { id, widgetItem, widgetMax } = useLocalSearchParams<{
    id: string;
    widgetItem?: string;
    widgetMax?: string;
  }>();
  return <AzkarDetails id={id} widgetItem={widgetItem} widgetMax={widgetMax} />;
}
