import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PhaseSettings } from "../../components/settings/PhaseSettings";
import { useProEntitlement } from "../../hooks/useProEntitlement";
import { useUserProfile } from "../../hooks/useUserProfile";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5 px-5">
      <Text className="text-text-tertiary text-[10px] font-semibold tracking-widest mb-3 ml-1">{title}</Text>
      <View className="bg-surface-secondary rounded-2xl overflow-hidden">{children}</View>
    </View>
  );
}
function Row({ label, value, onPress, destructive }: { label: string; value?: string; onPress?: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5" onPress={onPress} disabled={!onPress}>
      <Text className={`text-base ${destructive ? "text-warning" : "text-text-primary"}`}>{label}</Text>
      {value && <Text className="text-text-tertiary text-sm">{value}</Text>}
    </TouchableOpacity>
  );
}
function Divider() { return <View className="h-px bg-white/5 mx-4" />; }

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, switchPhase, setWeeklyDelta, overrideMacros } = useUserProfile();
  const { entitled } = useProEntitlement();

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}>
        <Text className="text-text-primary text-2xl font-bold px-5 mb-5">Settings</Text>
        {profile && (
          <Section title="PHASE">
            <PhaseSettings
              profile={profile}
              entitled={entitled}
              onSwitchPhase={(phase) => { switchPhase(phase).catch(console.error); }}
              onSelectWeeklyDelta={(kg) => { setWeeklyDelta(kg).catch(console.error); }}
              onEditMacros={(phase, ratio) => { overrideMacros(phase, ratio).catch(console.error); }}
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
          <Row label="Privacy Policy" onPress={() => Alert.alert("TODO")} /><Divider />
          <Row label="Terms of Service" onPress={() => Alert.alert("TODO")} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
