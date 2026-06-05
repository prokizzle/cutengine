import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-surface-primary items-center justify-center">
      <Text className="text-text-primary text-4xl font-bold">CutEngine</Text>
      <Text className="text-text-secondary text-lg mt-2">Expo spike — 2026-06-04</Text>
    </View>
  );
}
