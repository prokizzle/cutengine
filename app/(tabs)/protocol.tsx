import * as Sentry from "@sentry/react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SafeAreaView } from "react-native-safe-area-context";
import NLCycleParser, {
  type ParsedRule,
  type ParseResult,
} from "../../modules/expo-nl-cycle-parser/src";

const COMPOUND_HINTS = [
  "Test E",
  "Test C",
  "Test P",
  "Tren E",
  "Tren A",
  "Anavar",
  "Dianabol",
  "Mast E",
  "Mast P",
  "Primo",
  "EQ",
  "NPP",
  "Deca",
  "Anastrozole",
  "Aromasin",
  "Arimidex",
  "Cabergoline",
  "HCG",
  "Tadalafil",
  "Retatrutide",
  "MK-677",
];

function describeCadence(rule: ParsedRule): string {
  const parts: string[] = [];
  if (rule.amountMg != null) parts.push(`${rule.amountMg} mg`);
  parts.push(rule.cadenceText);
  if (rule.daysOfWeek?.length) {
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    parts.push(rule.daysOfWeek.map((d) => day[d] ?? `?${d}`).join("/"));
  }
  if (rule.startWeek != null) {
    parts.push(
      rule.endWeek != null && rule.endWeek !== rule.startWeek
        ? `wks ${rule.startWeek}–${rule.endWeek}`
        : `wk ${rule.startWeek}`,
    );
  }
  if (rule.timeOfDay) parts.push(rule.timeOfDay);
  return parts.join(" · ");
}

export default function ProtocolScreen() {
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const parseSchedule = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      Alert.alert("Empty input", "Paste a dosing schedule first.");
      return;
    }
    setParsing(true);
    try {
      const parsed = await NLCycleParser.parse(trimmed, COMPOUND_HINTS);
      setResult(parsed);
      if (parsed.rules.length === 0) {
        Alert.alert(
          "No rules detected",
          "The parser couldn't find any dosing rules in that text.",
        );
      }
    } catch (err) {
      Sentry.captureException(err);
      const message = err instanceof Error ? err.message : "Parse failed.";
      Alert.alert("Parse failed", message);
    } finally {
      setParsing(false);
    }
  }, [input]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>New Cycle</Text>
        <Text style={styles.subtitle}>
          Paste a dosing schedule in plain English.
        </Text>
        <TextInput
          style={styles.input}
          placeholder={
            "Test E 500mg/wk split Mon/Thu\nAnavar 50mg ED wks 1-6\nArimidex 0.5mg EOD"
          }
          placeholderTextColor="#8e8e93"
          multiline
          textAlignVertical="top"
          value={input}
          onChangeText={setInput}
          editable={!parsing}
        />
        <TouchableOpacity
          style={[styles.button, parsing && styles.buttonDisabled]}
          onPress={parseSchedule}
          disabled={parsing}
        >
          {parsing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Parse Schedule</Text>
          )}
        </TouchableOpacity>

        {result && result.rules.length > 0 && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>
                {result.scheduleName?.toUpperCase() ?? "PARSED RULES"}
              </Text>
              <Text style={styles.resultMethod}>
                via {result.method}
              </Text>
            </View>
            {result.rules.map((rule, idx) => {
              const name = result.tokenMap[rule.token] ?? rule.token;
              return (
                <View
                  key={`${rule.token}-${idx}`}
                  style={[
                    styles.ruleRow,
                    idx > 0 && styles.ruleRowDivider,
                  ]}
                >
                  <Text style={styles.ruleName}>{name}</Text>
                  <Text style={styles.ruleCadence}>{describeCadence(rule)}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PREVIOUS CYCLES</Text>
          <Text style={styles.cardBody}>
            No cycles yet. Create your first one above.
          </Text>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
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
    justifyContent: "center",
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#ffffff",
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.base,
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: theme.colors.elev,
    borderRadius: 16,
    padding: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  resultLabel: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.2,
  },
  resultMethod: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  ruleRow: {
    paddingVertical: 8,
  },
  ruleRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
  },
  ruleName: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  ruleCadence: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  card: {
    marginTop: 32,
    backgroundColor: theme.colors.elev,
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
