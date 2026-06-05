import { Text, View } from "react-native";

type Props = {
  protein: number;
  carbs: number;
  fat: number;
};

function MacroPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View className="flex-1 bg-surface-secondary rounded-xl px-3 py-3 items-center">
      <Text className="text-text-secondary text-xs mb-0.5">{label}</Text>
      <Text className="text-text-primary text-xl font-bold">
        {value}
        <Text className="text-text-tertiary text-sm font-normal">
          {" "}
          {unit}
        </Text>
      </Text>
    </View>
  );
}

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
