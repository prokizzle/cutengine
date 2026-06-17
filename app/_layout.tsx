import "../unistyles";

import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { useUpdates } from "expo-updates";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { UpdateBanner } from "../components/UpdateBanner";
import { checkAndFetchUpdate } from "../lib/ota";

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
  tracesSampleRate: 1.0,
});

export default function RootLayout() {
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

  // Fire-and-forget OTA check on launch. The banner mounted below picks up
  // the resulting state and surfaces a tap-to-restart cue once a bundle has
  // been staged.
  useEffect(() => {
    checkAndFetchUpdate();
  }, []);

  const { isUpdatePending } = useUpdates();
  const deviceInsets = useSafeAreaInsets();
  // The banner already consumes the device's top safe-area inset (it paints
  // under the notch via its own paddingTop). When it's visible we override
  // the inset context for everything below so screens don't add a second
  // top inset on top of the banner — eliminating the duplicate gap flagged
  // in cursor-bot review r3424607115.
  const scopedInsets = useMemo(
    () => (isUpdatePending ? { ...deviceInsets, top: 0 } : deviceInsets),
    [isUpdatePending, deviceInsets],
  );

  // First-launch onboarding gate lives in app/(tabs)/_layout.tsx — it must
  // run before any tab screen mounts, because mounted screens call
  // getUserProfile(), which creates the default singleton.
  return (
    <View style={styles.root}>
      <UpdateBanner visible={isUpdatePending} />
      <SafeAreaInsetsContext.Provider value={scopedInsets}>
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
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.surfacePrimary },
}));
