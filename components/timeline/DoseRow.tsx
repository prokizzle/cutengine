import { Text, TouchableOpacity, View } from "react-native";
import type { DoseEvent } from "../../types/timeline";

type Props = {
  event: DoseEvent;
  onPress?: (event: DoseEvent) => void;
};

export function DoseRow({ event, onPress }: Props) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5"
      activeOpacity={0.6}
      onPress={onPress ? () => onPress(event) : undefined}
    >
      <View
        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
          event.taken
            ? "bg-positive border-positive"
            : "border-text-tertiary/30"
        }`}
      >
        {event.taken && (
          <Text className="text-white text-[10px] font-bold">✓</Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-baseline gap-2">
          <Text
            className={`text-base ${
              event.taken
                ? "text-text-tertiary line-through"
                : "text-text-primary"
            }`}
          >
            {event.name}
          </Text>
          {event.dose != null && (
            <Text className="text-text-tertiary text-sm">
              {event.dose} {event.unit}
            </Text>
          )}
        </View>

        {event.regimen && (
          <Text className="text-text-tertiary/50 text-xs mt-0.5">
            {event.regimen}
            {event.weekLabel ? ` · ${event.weekLabel}` : ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
