import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "DORAR_CACHE:";
const INDEX = "DORAR_CACHE_INDEX";
const LIMIT = 60;

export async function readDorarCache(key: string) {
  try {
    return await AsyncStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

let writes = Promise.resolve();

export function writeDorarCache(key: string, raw: string) {
  writes = writes.then(() => write(key, raw));
  return writes;
}

async function write(key: string, raw: string) {
  try {
    const index: string[] = JSON.parse(
      (await AsyncStorage.getItem(INDEX)) ?? "[]",
    );
    const next = [key, ...index.filter((k) => k !== key)];
    const dropped = next.splice(LIMIT);
    await AsyncStorage.multiSet([
      [PREFIX + key, raw],
      [INDEX, JSON.stringify(next)],
    ]);
    if (dropped.length) {
      await AsyncStorage.multiRemove(dropped.map((k) => PREFIX + k));
    }
  } catch {}
}

export async function clearDorarCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(
      keys.filter((k) => k.startsWith(PREFIX) || k === INDEX),
    );
  } catch {}
}
