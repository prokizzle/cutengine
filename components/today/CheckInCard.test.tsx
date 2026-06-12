import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { CheckInCard } from "./CheckInCard";
import { questionsForPhase } from "../../utils/biofeedback";

const bulkQuestions = questionsForPhase("bulk");

describe("CheckInCard", () => {
  it("shows the done state when already completed today", () => {
    render(<CheckInCard questions={bulkQuestions} completedToday onSubmit={jest.fn()} />);
    expect(screen.getByText(/Check-in logged for today/)).toBeTruthy();
  });

  it("expands to show phase-specific questions", () => {
    render(<CheckInCard questions={bulkQuestions} completedToday={false} onSubmit={jest.fn()} />);
    fireEvent.press(screen.getByLabelText("Start daily check-in"));
    expect(screen.getByText("How intense was your training today?")).toBeTruthy();
    expect(screen.getByText("How lean do you feel you're staying?")).toBeTruthy();
  });

  it("submits answers with prompt context once every question is scored", () => {
    const onSubmit = jest.fn();
    render(<CheckInCard questions={bulkQuestions} completedToday={false} onSubmit={onSubmit} />);
    fireEvent.press(screen.getByLabelText("Start daily check-in"));

    // Save is disabled until all questions are answered
    fireEvent.press(screen.getByLabelText("Save check-in"));
    expect(onSubmit).not.toHaveBeenCalled();

    for (const question of bulkQuestions) {
      fireEvent.press(screen.getByLabelText(`${question.prompt} — 4 of 5`));
    }
    fireEvent.press(screen.getByLabelText("Save check-in"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const answers = onSubmit.mock.calls[0][0];
    expect(answers).toHaveLength(bulkQuestions.length);
    expect(answers[0]).toEqual({
      questionID: bulkQuestions[0].id,
      prompt: bulkQuestions[0].prompt,
      score: 4,
    });
  });
});
