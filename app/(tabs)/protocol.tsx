import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtocolScreen() {
  const [input, setInput] = useState("");
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.flex1} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>New Cycle</Text>
        <Text style={styles.subtitle}>Paste a dosing schedule in plain English.</Text>
        <TextInput
          style={styles.input}
          placeholder="Test E 500mg/wk split Mon/Thu\nAnavar 50mg ED wks 1-6\nArimidex 0.5mg EOD"
          placeholderTextColor="#8e8e93"
          multiline
          textAlignVertical="top"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("TODO", "NLCycleParser integration")}>
          <Text style={styles.buttonText}>Parse Schedule</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PREVIOUS CYCLES</Text>
          <Text style={styles.cardBody}>No cycles yet. Create your first one above.</Text>
        </View>
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
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: 20,
  },
  input: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.xl,
    padding: 16,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    minHeight: 160,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.positive,
    borderRadius: theme.radius.xl,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.base,
  },
  card: {
    marginTop: 32,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
  },
  cardLabel: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
    marginBottom: 8,
  },
  cardBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
}));
