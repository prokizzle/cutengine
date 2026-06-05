import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIME_BLOCKS = [
  { time: "08:00", label: "Breakfast", items: ["3 eggs scrambled", "1 cup oats", "1 banana"] },
  { time: "12:30", label: "Lunch", items: ["200g chicken breast", "1 cup rice", "Steamed broccoli"] },
  { time: "16:00", label: "Snack", items: ["Protein shake", "Apple", "30g almonds"] },
  { time: "19:00", label: "Dinner", items: ["250g salmon", "Sweet potato", "Asparagus"] },
];

export default function MealsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-text-primary text-2xl font-bold mb-5">Meals</Text>
        {TIME_BLOCKS.map((block) => (
          <View key={block.time} className="mb-4">
            <View className="flex-row items-baseline gap-2 mb-2">
              <Text className="text-text-tertiary text-xs font-semibold">{block.time}</Text>
              <Text className="text-text-primary text-base font-medium">{block.label}</Text>
            </View>
            <View className="bg-surface-secondary rounded-xl px-4 py-3">
              {block.items.map((item, i) => (
                <View key={i} className="flex-row items-center gap-3 py-1.5">
                  <View className="w-5 h-5 rounded-full border border-text-tertiary/30 items-center justify-center" />
                  <Text className="text-text-primary text-sm">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
