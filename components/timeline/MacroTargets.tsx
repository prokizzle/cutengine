import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { MacroPill } from "./MacroPill";

type Props = {
  protein: number;
  carbs: number;
  fat: number;
};

export function MacroTargets({ protein, carbs, fat }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MacroPill label="Protein" value={protein} unit="g" color="#ff3b30" />
        <MacroPill label="Carbs" value={carbs} unit="g" color="#ff9f0a" />
        <MacroPill label="Fat" value={fat} unit="g" color="#007aff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
}));
