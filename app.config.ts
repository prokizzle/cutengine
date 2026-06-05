import type { ExpoConfig } from "@expo/config-types";

const IS_SIDELOAD = process.env.APP_VARIANT === "sideload";

const config: ExpoConfig = {
  name: IS_SIDELOAD ? "CutEngine Pro" : "CutEngine",
  slug: "cutengine",
  version: "2.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "cutengine",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_SIDELOAD
      ? "com.feelingmindful.cutengine.power"
      : "com.feelingmindful.diet-plan",
    infoPlist: {
      NSHealthShareUsageDescription:
        "CutEngine reads your weight, active energy, and body metrics to compute your daily calorie target.",
      NSHealthUpdateUsageDescription:
        "CutEngine writes your body mass to Apple Health.",
    },
  },
  plugins: [
    "expo-router",
    "@sentry/react-native/expo",
    "./plugins/withSeedJson",
  ],
  experiments: {
    typedRoutes: true,
    reactCanary: true,
  },
  extra: {
    APP_VARIANT: process.env.APP_VARIANT ?? "production",
    seedIncluded: IS_SIDELOAD,
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "",
    },
  },
};

export default config;
