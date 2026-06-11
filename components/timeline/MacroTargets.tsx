import { View } from "react-native";
import { MacroPill } from "./MacroPill";

type Props = {
  protein: number;
  carbs: number;
  fat: number;
};

export function MacroTargets({ protein, carbs, fat }: Props) {
  return (
    <View className="px-5 mb-4">
      <View className="flex-row gap-2">
        <MacroPill label="Protein" value={protein} unit="g" color="#ff3b30" />
        <MacroPill label="Carbs" value={carbs} unit="g" color="#ff9f0a" />
        <MacroPill label="Fat" value={fat} unit="g" color="#007aff" />
      </View>
    </View>
  );
}
