const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = withNativewind(getDefaultConfig(__dirname));
const resolveCss = config.resolver.resolveRequest;
const PLAIN_REACT_NATIVE = /[\\/]node_modules[\\/]expo-asset[\\/]/;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-native" &&
    PLAIN_REACT_NATIVE.test(context.originModulePath)
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return resolveCss(context, moduleName, platform);
};

module.exports = config;
