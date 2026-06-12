import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { BiofeedbackAnswer } from "../../modules/expo-cycle-store/src/biofeedback";
import { buildAnswers, type BiofeedbackQuestion } from "../../utils/biofeedback";

type Props = {
  questions: BiofeedbackQuestion[];
  /** True once an entry exists for today — collapses to a done state. */
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
    <View className="mb-4">
      <Text className="text-text-primary text-sm mb-2">{question.prompt}</Text>
      <View className="flex-row gap-2">
        {SCORES.map((score) => (
          <TouchableOpacity
            key={score}
            accessibilityLabel={`${question.prompt} — ${score} of 5`}
            className={`flex-1 items-center py-2 rounded-xl ${
              value === score ? "bg-positive/20 border border-positive" : "bg-surface-tertiary"
            }`}
            onPress={() => onSelect(score)}
          >
            <Text className={value === score ? "text-positive font-bold" : "text-text-secondary"}>
              {score}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-text-tertiary text-[10px]">{question.minLabel}</Text>
        <Text className="text-text-tertiary text-[10px]">{question.maxLabel}</Text>
      </View>
    </View>
  );
}

/** Daily biofeedback check-in — questions adapt to the current phase. */
export function CheckInCard({ questions, completedToday, onSubmit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [scores, setScores] = useState<Record<string, number | undefined>>({});

  if (completedToday) {
    return (
      <View className="mx-5 mb-4 bg-surface-secondary rounded-2xl p-4">
        <Text className="text-positive text-sm font-medium">✓ Check-in logged for today</Text>
      </View>
    );
  }

  if (!expanded) {
    return (
      <TouchableOpacity
        className="mx-5 mb-4 bg-surface-secondary rounded-2xl p-4"
        onPress={() => setExpanded(true)}
        accessibilityLabel="Start daily check-in"
      >
        <Text className="text-text-primary text-base font-semibold">Daily check-in</Text>
        <Text className="text-text-tertiary text-sm mt-0.5">
          {questions.length} quick questions for your current phase
        </Text>
      </TouchableOpacity>
    );
  }

  const answers = buildAnswers(questions, scores);
  const complete = answers.length === questions.length;

  return (
    <View className="mx-5 mb-4 bg-surface-secondary rounded-2xl p-4">
      <Text className="text-text-primary text-base font-semibold mb-4">Daily check-in</Text>
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
        className={`items-center py-3 rounded-xl ${complete ? "bg-positive" : "bg-surface-tertiary"}`}
        onPress={() => onSubmit(answers)}
        accessibilityLabel="Save check-in"
      >
        <Text className={complete ? "text-surface-primary font-bold" : "text-text-tertiary"}>
          Save check-in
        </Text>
      </TouchableOpacity>
    </View>
  );
}
