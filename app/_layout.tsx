import "../global.css";

import * as Sentry from "@sentry/react-native";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

import { hasUserProfile } from "../lib/cycleStore";

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  tracesSampleRate: 1.0,
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    if (!RC_API_KEY) {
      console.warn("[RevenueCat] EXPO_PUBLIC_REVENUECAT_API_KEY not set");
      return;
    }
    Purchases.configure({ apiKey: RC_API_KEY });
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
  }, []);

  // First launch: no UserProfile singleton yet → run phase-first onboarding.
  useEffect(() => {
    hasUserProfile()
      .then((exists) => {
        if (!exists) router.replace("/onboarding");
      })
      .catch(console.error);
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="paywall"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="customer-center"
        options={{ presentation: "modal", headerShown: true, title: "Customer Center" }}
      />
    </Stack>
  );
}
