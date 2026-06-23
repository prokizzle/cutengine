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
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    // @ts-expect-error - appleId is a valid Expo CLI runtime field used for App Store Connect lookups, but is not yet in @expo/config-types. Remove this directive once the type is added upstream.
    appleId: "6757690403",
    bundleIdentifier: IS_SIDELOAD
      ? "com.feelingmindful.cutengine.power"
      : "com.feelingmindful.diet-plan",
    icon: "./assets/app-icon.icon",
    entitlements: {
      "com.apple.developer.healthkit": true,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSHealthShareUsageDescription:
        "CutEngine reads your weight, active energy, and body metrics to compute your daily calorie target.",
      NSHealthUpdateUsageDescription:
        "CutEngine writes your body mass to Apple Health.",
    },
  },
  android: {
    package: "com.feelingmindful.cutengine",
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon.png",
      backgroundColor: "#FFFFFF",
      monochromeImage: "./assets/android-icon.png",
    },
  },
  updates: {
    url: "https://u.expo.dev/fc6ac35c-8c91-4d68-a4b0-5a7cfdeb9749",
  },
  runtimeVersion: {
    policy: "fingerprint",
  },
  plugins: [
    "expo-router",
    [
      "@sentry/react-native/expo",
      {
        organization: "feeling-mindful",
        project: "cutengine",
      },
    ],
    "./plugins/withSeedJson",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "17.0",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    APP_VARIANT: process.env.APP_VARIANT ?? "production",
    seedIncluded: IS_SIDELOAD,
    eas: {
      projectId: "fc6ac35c-8c91-4d68-a4b0-5a7cfdeb9749",
    },
  },
};

export default config;
