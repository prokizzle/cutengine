import * as Sentry from "@sentry/react-native";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { PhaseSettings } from "../../components/settings/PhaseSettings";
import { useProEntitlement } from "../../hooks/useProEntitlement";
import { useUserProfile } from "../../hooks/useUserProfile";
import { applyUpdate, checkAndFetchUpdate } from "../../lib/ota";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}
function Row({ label, value, onPress, destructive }: { label: string; value?: string; onPress?: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
    </TouchableOpacity>
  );
}
function Divider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, switchPhase, setWeeklyDelta, overrideMacros } = useUserProfile();
  const { entitled } = useProEntitlement();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const channel = Updates.channel ?? "embedded";
  const updateId = Updates.updateId?.slice(0, 8) ?? "none";

  const reportSaveFailure = (err: unknown) => {
    Sentry.captureException(err);
    Alert.alert("Couldn't save", "Your phase settings didn't save. Please try again.");
  };

  const onCheckForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      const outcome = await checkAndFetchUpdate();
      switch (outcome.status) {
        case "disabled":
          Alert.alert("Updates disabled", "OTA updates only run in release builds.");
          return;
        case "up-to-date":
          Alert.alert("Up to date", "You're on the latest build for this channel.");
          return;
        case "staged":
        case "already-pending":
          Alert.alert(
            "Update ready",
            outcome.status === "already-pending"
              ? "An update is already waiting. Restart to apply?"
              : "Restart now to apply?",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Restart",
                onPress: () => {
                  applyUpdate().catch((err) => Sentry.captureException(err));
                },
              },
            ],
          );
          return;
        case "error":
          Alert.alert(
            "Update check failed",
            "Couldn't reach the update server. Try again later.",
          );
          return;
      }
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}>
        <Text style={styles.header}>Settings</Text>
        {profile && (
          <Section title="PHASE">
            <PhaseSettings
              profile={profile}
              entitled={entitled}
              onSwitchPhase={(phase) => { switchPhase(phase).catch(reportSaveFailure); }}
              onSelectWeeklyDelta={(kg) => { setWeeklyDelta(kg).catch(reportSaveFailure); }}
              onEditMacros={(phase, ratio) => { overrideMacros(phase, ratio).catch(reportSaveFailure); }}
              onRequirePro={() => router.push("/paywall")}
            />
          </Section>
        )}
        <Section title="PROFILE">
          <Row label="Height" value={`5'10″`} onPress={() => Alert.alert("TODO")} /><Divider />
          <Row label="Date of Birth" value="Jan 15, 1990" onPress={() => Alert.alert("TODO")} /><Divider />
          <Row label="Biological Sex" value="Male" onPress={() => Alert.alert("TODO")} />
        </Section>
        <Section title="UNITS">
          <Row label="Weight" value="lb" onPress={() => Alert.alert("TODO")} /><Divider />
          <Row label="Energy" value="kcal" onPress={() => Alert.alert("TODO")} />
        </Section>
        <Section title="SUBSCRIPTION">
          <Row label="CutEngine Pro" onPress={() => router.push("/paywall")} /><Divider />
          <Row label="Customer Center" onPress={() => router.push("/customer-center")} />
        </Section>
        <Section title="DATA">
          <Row label="Export Protocol Data" onPress={() => Alert.alert("TODO")} /><Divider />
          <Row label="Reset All Data" destructive onPress={() => Alert.alert("TODO")} />
        </Section>
        <Section title="ABOUT">
          <Row label="Version" value="2.0.0" /><Divider />
          <Row label="Update channel" value={channel} /><Divider />
          <Row label="Bundle" value={updateId} /><Divider />
          <Row
            label={checkingUpdate ? "Checking…" : "Check for updates"}
            onPress={checkingUpdate ? undefined : onCheckForUpdates}
          /><Divider />
          <Row label="Privacy Policy" onPress={() => Alert.alert("TODO")} /><Divider />
          <Row label="Terms of Service" onPress={() => Alert.alert("TODO")} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
  },
  flex1: { flex: 1 },
  header: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionBody: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
  },
  rowLabelDestructive: {
    color: theme.colors.warning,
  },
  rowValue: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 16,
  },
}));
