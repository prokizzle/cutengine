import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PhaseSuggestionCard } from "./PhaseSuggestionCard";
import type { PhaseSuggestion } from "../../utils/phaseSuggestion";

const suggestion: PhaseSuggestion = {
  kind: "plateau",
  title: "Plateau detected",
  body: "Weight has been flat for 2+ weeks. Consider a refeed week or switching phase.",
  trendKgPerWeek: 0.01,
};

describe("PhaseSuggestionCard", () => {
  it("renders title and body", () => {
    render(<PhaseSuggestionCard suggestion={suggestion} />);
    expect(screen.getByText("Plateau detected")).toBeTruthy();
    expect(screen.getByText(/refeed week/)).toBeTruthy();
  });

  it("calls onDismiss", () => {
    const onDismiss = jest.fn();
    render(<PhaseSuggestionCard suggestion={suggestion} onDismiss={onDismiss} />);
    fireEvent.press(screen.getByLabelText("Dismiss suggestion"));
    expect(onDismiss).toHaveBeenCalled();
  });
});
