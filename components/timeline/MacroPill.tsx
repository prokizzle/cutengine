import { Text, View } from "react-native";

type Props = {
  label: string;
  value: number;
  unit: string;
  color: string;
};

export function MacroPill({ label, value, unit, color }: Props) {
  return (
    <View
      className="flex-1 bg-surface-secondary rounded-xl px-3 py-3 items-center border-t-2"
      style={{ borderTopColor: color }}
    >
      <Text className="text-text-secondary text-xs mb-0.5">{label}</Text>
      <Text className="text-text-primary text-xl font-bold">
        {value}
        <Text className="text-text-tertiary text-sm font-normal"> {unit}</Text>
      </Text>
    </View>
  );
}
