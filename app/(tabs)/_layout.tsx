import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { Text } from "react-native";

const TAB_ICONS: Record<string, string> = {
  calendar: "📅",
  "list.bullet.clipboard": "📋",
  "fork.knife": "🍽",
  gearshape: "⚙",
};

export default function TabLayout() {
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
