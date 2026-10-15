/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "MaabWidget",
  displayName: "Maab",
  deploymentTarget: "17.0",
  bundleIdentifier: ".widget",
  colors: {
    $accent: { color: "#18766f", darkColor: "#4fb8ae" },
    $widgetBackground: { color: "#0f4f4a", darkColor: "#072724" },
  },
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"],
  },
});
