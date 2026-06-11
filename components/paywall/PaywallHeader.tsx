import { Text, View } from "react-native";

export function PaywallHeader() {
  return (
    <View className="px-5 pt-12 pb-8 items-center">
      <Text className="text-text-primary text-3xl font-bold text-center">
        CutEngine Pro
      </Text>
      <Text className="text-text-secondary text-base text-center mt-3 leading-5">
        Advanced protocol tracking, cycle management, and AI-powered schedule
        parsing.
      </Text>
    </View>
  );
}
