const { withAndroidManifest } = require("expo/config-plugins");

const FEATURES = [
  "android.hardware.location",
  "android.hardware.location.network",
  "android.hardware.location.gps",
];

module.exports = function withOptionalLocation(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest["uses-feature"] = (manifest["uses-feature"] ?? []).filter(
      (feature) => !FEATURES.includes(feature.$["android:name"]),
    );
    for (const name of FEATURES) {
      manifest["uses-feature"].push({
        $: { "android:name": name, "android:required": "false" },
      });
    }
    return config;
  });
};
