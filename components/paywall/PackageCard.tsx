import { Text, TouchableOpacity, View } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { tierDisplayName } from "../../lib/revenueCat";

type Props = {
  pkg: PurchasesPackage;
  disabled: boolean;
  onPress: (pkg: PurchasesPackage) => void;
};

function BadgePill({ label }: { label: string }) {
  return (
    <View className="mt-3 bg-positive/20 rounded-lg px-3 py-1.5 self-start">
      <Text className="text-positive text-xs font-semibold">{label}</Text>
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
      className={`bg-surface-secondary rounded-2xl px-5 py-4 border-2 ${
        isHighlighted ? "border-positive" : "border-transparent"
      }`}
      onPress={() => onPress(pkg)}
      disabled={disabled}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-text-primary text-lg font-semibold">
            {title}
          </Text>
          <Text className="text-text-tertiary text-sm mt-0.5">{subtitle}</Text>
        </View>
        <View className="items-end">
          <Text className="text-text-primary text-xl font-bold">
            {pkg.product.priceString}
          </Text>
          <Text className="text-text-tertiary text-xs">
            {isAnnual ? "/year" : isLifetime ? " once" : "/month"}
          </Text>
        </View>
      </View>
      {isLifetime && <BadgePill label="BEST VALUE" />}
      {isAnnual && <BadgePill label="MOST POPULAR" />}
    </TouchableOpacity>
  );
}
