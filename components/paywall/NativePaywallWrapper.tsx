import { View } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";

type RestoreResult = { customerInfo: CustomerInfo };

type Props = {
  onDismiss: () => void;
  onRestoreCompleted?: (result: RestoreResult) => void;
};

export function NativePaywallWrapper({ onDismiss, onRestoreCompleted }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        onRestoreCompleted={onRestoreCompleted}
        onDismiss={onDismiss}
      />
    </View>
  );
}
