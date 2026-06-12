import { Text, View } from "react-native";
import type { Phase } from "../../modules/expo-cycle-store/src/userProfile";
import { PHASE_COLOR } from "../../utils/phase";

type Props = {
  phase: Phase;
  /** Optional trailing detail, e.g. "Week 8". */
  detail?: string;
};

/** Dashboard phase pill — CUT red, BULK green, MAINTENANCE blue. */
export function PhaseBadge({ phase, detail }: Props) {
  const color = PHASE_COLOR[phase];
  return (
    <View className="flex-row items-center self-start rounded-full px-3 py-1" style={{ backgroundColor: `${color}26` }}>
      <View className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: color }} />
      <Text className="text-xs font-bold tracking-widest" style={{ color }}>
        {phase.toUpperCase()}
        {detail ? <Text className="font-medium">{`  ${detail}`}</Text> : null}
      </Text>
    </View>
  );
}
