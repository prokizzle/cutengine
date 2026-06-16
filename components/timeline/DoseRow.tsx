import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { DoseEvent } from "../../types/timeline";

type Props = {
  event: DoseEvent;
  onPress?: (event: DoseEvent) => void;
};

export function DoseRow({ event, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={onPress ? () => onPress(event) : undefined}
    >
      <View style={[styles.checkbox, event.taken ? styles.checkboxTaken : styles.checkboxEmpty]}>
        {event.taken && <Text style={styles.checkMark}>✓</Text>}
      </View>

      <View style={styles.body}>
        <View style={styles.bodyRow}>
          <Text style={event.taken ? styles.nameTaken : styles.nameDefault}>
            {event.name}
          </Text>
          {event.dose != null && (
            <Text style={styles.dose}>
              {event.dose} {event.unit}
            </Text>
          )}
        </View>

        {event.regimen && (
          <Text style={styles.regimen}>
            {event.regimen}
            {event.weekLabel ? ` · ${event.weekLabel}` : ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxTaken: {
    backgroundColor: theme.colors.positive,
    borderColor: theme.colors.positive,
  },
  checkboxEmpty: {
    borderColor: "rgba(142,142,147,0.3)",
  },
  checkMark: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  body: { flex: 1 },
  bodyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  nameDefault: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
  },
  nameTaken: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textTertiary,
    textDecorationLine: "line-through",
  },
  dose: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
  regimen: {
    color: "rgba(142,142,147,0.5)",
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
}));
