import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { BiofeedbackAnswer } from "../../modules/expo-cycle-store/src/biofeedback";
import { buildAnswers, type BiofeedbackQuestion } from "../../utils/biofeedback";

type Props = {
  questions: BiofeedbackQuestion[];
  completedToday: boolean;
  onSubmit: (answers: BiofeedbackAnswer[]) => void;
};

const SCORES = [1, 2, 3, 4, 5];

function ScoreRow({
  question,
  value,
  onSelect,
}: {
  question: BiofeedbackQuestion;
  value?: number;
  onSelect: (score: number) => void;
}) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.scoreButtons}>
        {SCORES.map((score) => {
          const active = value === score;
          return (
            <TouchableOpacity
              key={score}
              accessibilityLabel={`${question.prompt} — ${score} of 5`}
              style={[styles.scoreButton, active ? styles.scoreButtonActive : styles.scoreButtonInactive]}
              onPress={() => onSelect(score)}
            >
              <Text style={active ? styles.scoreTextActive : styles.scoreTextInactive}>
                {score}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>{question.minLabel}</Text>
        <Text style={styles.labelText}>{question.maxLabel}</Text>
      </View>
    </View>
  );
}

export function CheckInCard({ questions, completedToday, onSubmit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [scores, setScores] = useState<Record<string, number | undefined>>({});

  if (completedToday) {
    return (
      <View style={styles.card}>
        <Text style={styles.doneText}>✓ Check-in logged for today</Text>
      </View>
    );
  }

  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpanded(true)}
        accessibilityLabel="Start daily check-in"
      >
        <Text style={styles.cardTitle}>Daily check-in</Text>
        <Text style={styles.cardSubtitle}>
          {questions.length} quick questions for your current phase
        </Text>
      </TouchableOpacity>
    );
  }

  const answers = buildAnswers(questions, scores);
  const complete = answers.length === questions.length;

  return (
    <View style={styles.card}>
      <Text style={styles.expandedTitle}>Daily check-in</Text>
      {questions.map((question) => (
        <ScoreRow
          key={question.id}
          question={question}
          value={scores[question.id]}
          onSelect={(score) => setScores((prev) => ({ ...prev, [question.id]: score }))}
        />
      ))}
      <TouchableOpacity
        disabled={!complete}
        style={[styles.submitButton, complete ? styles.submitButtonActive : styles.submitButtonInactive]}
        onPress={() => onSubmit(answers)}
        accessibilityLabel="Save check-in"
      >
        <Text style={complete ? styles.submitTextActive : styles.submitTextInactive}>
          Save check-in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
  },
  doneText: {
    color: theme.colors.positive,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  cardSubtitle: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  expandedTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: 16,
  },
  scoreRow: { marginBottom: 16 },
  prompt: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    marginBottom: 8,
  },
  scoreButtons: {
    flexDirection: "row",
    gap: 8,
  },
  scoreButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: theme.radius.xl,
  },
  scoreButtonActive: {
    backgroundColor: "rgba(52,199,89,0.2)",
    borderWidth: 1,
    borderColor: theme.colors.positive,
  },
  scoreButtonInactive: {
    backgroundColor: theme.colors.surfaceTertiary,
  },
  scoreTextActive: {
    color: theme.colors.positive,
    fontWeight: theme.fontWeight.bold,
  },
  scoreTextInactive: {
    color: theme.colors.textSecondary,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  labelText: {
    color: theme.colors.textTertiary,
    fontSize: 10,
  },
  submitButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: theme.radius.xl,
  },
  submitButtonActive: {
    backgroundColor: theme.colors.positive,
  },
  submitButtonInactive: {
    backgroundColor: theme.colors.surfaceTertiary,
  },
  submitTextActive: {
    color: theme.colors.surfacePrimary,
    fontWeight: theme.fontWeight.bold,
  },
  submitTextInactive: {
    color: theme.colors.textTertiary,
  },
}));
