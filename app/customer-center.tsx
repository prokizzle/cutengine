import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import RevenueCatUI from "react-native-purchases-ui";

export default function CustomerCenterScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#1c1c1e" }}>
      <RevenueCatUI.CustomerCenterView
        style={{ flex: 1 }}
        onDismiss={() => router.back()}
        onRestoreStarted={() => {
          // optional: show loading indicator
        }}
        onRestoreCompleted={({ customerInfo }) => {
          if (
            customerInfo.entitlements.active["CutEngine Pro"] !== undefined
          ) {
            Alert.alert("Restored", "Your purchases have been restored.");
          }
        }}
        onRestoreFailed={({ error }) => {
          Alert.alert(
            "Restore Failed",
            error?.message ?? "Unable to restore purchases.",
          );
        }}
        onShowingManageSubscriptions={() => {
          // User tapped "Manage Subscriptions" — handled natively
        }}
        onFeedbackSurveyCompleted={() => {
          // optional: track survey completion
        }}
      />
    </View>
  );
}
