import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import { CustomAdhan } from "../_data/adhanSounds";

export default async function pickCustomAdhan(
  slot = "all",
): Promise<CustomAdhan | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "audio/*",
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const name = asset.name.replace(/\.[^.]+$/, "");

  if (Platform.OS === "web") return { uri: asset.uri, name };

  const { Directory, File, Paths } = await import("expo-file-system");
  const folder = new Directory(Paths.document, "adhan", slot);
  folder.create({ idempotent: true, intermediates: true });
  for (const old of folder.list()) old.delete();

  const extension = asset.name.match(/\.[^.]+$/)?.[0] ?? ".mp3";
  const target = new File(folder, `custom_${Date.now()}${extension}`);
  await new File(asset.uri).copy(target);
  return { uri: target.uri, name };
}
