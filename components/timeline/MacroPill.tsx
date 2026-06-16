import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  label: string;
  value: number;
  unit: string;
  color: string;
};

export function MacroPill({ label, value, unit, color }: Props) {
  return (
    <View style={[styles.container, { borderTopColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 2,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 2,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  unit: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.regular,
  },
}));
