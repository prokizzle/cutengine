import { Text, View } from "react-native";
import type { DoseEvent } from "../../types/timeline";
import { getBucketLabel } from "../../utils/timeline";
import { DoseRow } from "./DoseRow";

type Props = {
  tod: string;
  items: DoseEvent[];
};

export function BucketSection({ tod, items }: Props) {
  return (
    <View className="mb-5">
      <Text className="text-text-tertiary text-[10px] font-semibold tracking-widest mb-3 ml-1">
        {getBucketLabel(tod)}
      </Text>
      <View className="bg-surface-secondary rounded-2xl overflow-hidden">
        {items.map((event, index) => (
          <View key={event.id}>
            {index > 0 && <View className="h-px bg-white/5 mx-4" />}
            <DoseRow event={event} />
          </View>
        ))}
      </View>
    </View>
  );
}
