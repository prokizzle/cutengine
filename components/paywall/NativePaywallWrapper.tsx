import { View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";

type Props = {
  onDismiss: () => void;
  onRestoreCompleted?: () => void;
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
