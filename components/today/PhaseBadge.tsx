import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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
    <View style={[styles.container, { backgroundColor: `${color}26` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>
        {phase.toUpperCase()}
        {detail ? <Text style={styles.detail}>{`  ${detail}`}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1.5,
  },
  detail: {
    fontWeight: theme.fontWeight.medium,
  },
}));
