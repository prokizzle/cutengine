import type { ColorValue } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

import { hasUserProfile } from "../../lib/cycleStore";

const TAB_ICONS: Record<string, string> = {
  calendar: "📅",
  "list.bullet.clipboard": "📋",
  "fork.knife": "🍽",
  gearshape: "⚙",
};

export default function TabLayout() {
  // First-launch gate. This must resolve BEFORE any tab screen mounts:
  // tab screens call getUserProfile(), which inserts the default singleton
  // and would make hasUserProfile() race to true, silently skipping
  // onboarding. A confirmed-missing profile (false) routes to onboarding.
  // On error we fall through to the tabs rather than trapping the user on
  // onboarding (where the same store error recurs) — see hasUserProfile().
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    hasUserProfile()
      .then(setProfileExists)
      .catch((err) => {
        console.error("[TabLayout] hasUserProfile failed:", err);
        setProfileExists(true);
      });
  }, []);

  if (profileExists === null) {
    return null;
  }
  if (!profileExists) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1c1c1e",
          borderTopColor: "#2c2c2e",
        },
        tabBarActiveTintColor: "#34c759",
        tabBarInactiveTintColor: "#8e8e93",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: tabBarIcon("calendar") }}
      />
      <Tabs.Screen
        name="protocol"
        options={{
          title: "Protocol",
          tabBarIcon: tabBarIcon("list.bullet.clipboard"),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: tabBarIcon("fork.knife"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: tabBarIcon("gearshape"),
        }}
      />
    </Tabs>
  );
}

function tabBarIcon(name: string) {
  return ({ size }: { focused: boolean; color: ColorValue; size: number }) => (
    <Text style={{ fontSize: size - 4 }}>{TAB_ICONS[name] ?? "•"}</Text>
  );
}
