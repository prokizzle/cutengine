import { buildAnswers, questionsForPhase } from "./biofeedback";

describe("questionsForPhase", () => {
  it("returns at least 5 bulk-specific questions covering the required areas", () => {
    const bulk = questionsForPhase("bulk");
    expect(bulk.length).toBeGreaterThanOrEqual(5);
    const ids = bulk.map((q) => q.id).join(" ");
    expect(ids).toMatch(/training/);
    expect(ids).toMatch(/appetite/);
    expect(ids).toMatch(/recovery/);
    expect(ids).toMatch(/sleep/);
    expect(ids).toMatch(/body-comp/);
  });

  it("keeps cut and bulk question sets distinct", () => {
    const cutIds = new Set(questionsForPhase("cut").map((q) => q.id));
    for (const q of questionsForPhase("bulk")) {
      expect(cutIds.has(q.id)).toBe(false);
    }
  });

  it("provides a maintenance set", () => {
    expect(questionsForPhase("maintenance").length).toBeGreaterThan(0);
  });
});

describe("buildAnswers", () => {
  it("captures prompt text with each answer and skips unanswered questions", () => {
    const questions = questionsForPhase("bulk");
    const answers = buildAnswers(questions, {
      "bulk-training-intensity": 4,
      "bulk-appetite": 2,
    });
    expect(answers).toHaveLength(2);
    expect(answers[0]).toEqual({
      questionID: "bulk-training-intensity",
      prompt: "How intense was your training today?",
      score: 4,
    });
  });
});
