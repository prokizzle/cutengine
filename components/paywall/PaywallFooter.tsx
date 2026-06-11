import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  restoring: boolean;
  onRestore: () => void;
};

export function PaywallFooter({ restoring, onRestore }: Props) {
  return (
    <View className="px-5 mt-6 items-center gap-3">
      <TouchableOpacity onPress={onRestore} disabled={restoring}>
        <Text className="text-info text-sm font-medium">
          {restoring ? "Restoring..." : "Restore Purchases"}
        </Text>
      </TouchableOpacity>
      <Text className="text-text-tertiary text-xs text-center px-4">
        Payment charged to your Apple ID. Auto-renews unless cancelled 24h
        before period ends.{"\n"}
        <Text className="text-info/70">Terms · Privacy</Text>
      </Text>
    </View>
  );
}
