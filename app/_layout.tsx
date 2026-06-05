import "../global.css";

import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { useEffect } from "react";
import Purchases from "react-native-purchases";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  tracesSampleRate: 1.0,
});

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY) {
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
      });
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
