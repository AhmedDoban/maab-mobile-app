import { Linking } from "react-native";

type MosqueCoordinates = {
  name: string;
  latitude: number;
  longitude: number;
};

export default async function openMosqueMaps({
  name,
  latitude,
  longitude,
}: MosqueCoordinates) {
  const query = encodeURIComponent(`${latitude},${longitude} (${name})`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn("Failed to open mosque location", error);
  }
}
