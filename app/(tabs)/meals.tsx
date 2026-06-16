import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";

const TIME_BLOCKS = [
  { time: "08:00", label: "Breakfast", items: ["3 eggs scrambled", "1 cup oats", "1 banana"] },
  { time: "12:30", label: "Lunch", items: ["200g chicken breast", "1 cup rice", "Steamed broccoli"] },
  { time: "16:00", label: "Snack", items: ["Protein shake", "Apple", "30g almonds"] },
  { time: "19:00", label: "Dinner", items: ["250g salmon", "Sweet potato", "Asparagus"] },
];

export default function MealsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.flex1} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.header}>Meals</Text>
        {TIME_BLOCKS.map((block) => (
          <View key={block.time} style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.time}>{block.time}</Text>
              <Text style={styles.label}>{block.label}</Text>
            </View>
            <View style={styles.card}>
              {block.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
  },
  flex1: { flex: 1 },
  header: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 20,
  },
  block: { marginBottom: 16 },
  blockHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  time: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  card: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  bullet: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(142,142,147,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
  },
}));
