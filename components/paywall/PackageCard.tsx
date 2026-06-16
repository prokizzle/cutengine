import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { PurchasesPackage } from "react-native-purchases";
import { tierDisplayName } from "../../lib/revenueCat";

type Props = {
  pkg: PurchasesPackage;
  disabled: boolean;
  onPress: (pkg: PurchasesPackage) => void;
};

function BadgePill({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function PackageCard({ pkg, disabled, onPress }: Props) {
  const { title, subtitle } = tierDisplayName(pkg);
  const isAnnual = pkg.identifier === "$rc_annual";
  const isLifetime = pkg.identifier === "$rc_lifetime";
  const isHighlighted = isAnnual || isLifetime;

  return (
    <TouchableOpacity
      style={[styles.card, isHighlighted ? styles.cardHighlighted : styles.cardDefault]}
      onPress={() => onPress(pkg)}
      disabled={disabled}
    >
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>{pkg.product.priceString}</Text>
          <Text style={styles.period}>
            {isAnnual ? "/year" : isLifetime ? " once" : "/month"}
          </Text>
        </View>
      </View>
      {isLifetime && <BadgePill label="BEST VALUE" />}
      {isAnnual && <BadgePill label="MOST POPULAR" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
  },
  cardHighlighted: {
    borderColor: theme.colors.positive,
  },
  cardDefault: {
    borderColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  subtitle: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  priceCol: {
    alignItems: "flex-end",
  },
  price: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  period: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
  },
  badge: {
    marginTop: 12,
    backgroundColor: "rgba(52,199,89,0.2)",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: theme.colors.positive,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
}));
