import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { DoseEvent } from "../../types/timeline";
import { getBucketLabel } from "../../utils/timeline";
import { DoseRow } from "./DoseRow";

type Props = {
  tod: string;
  items: DoseEvent[];
};

export function BucketSection({ tod, items }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{getBucketLabel(tod)}</Text>
      <View style={styles.body}>
        {items.map((event, index) => (
          <View key={event.id}>
            {index > 0 && <View style={styles.divider} />}
            <DoseRow event={event} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { marginBottom: 20 },
  label: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  body: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 16,
  },
}));
