import React from "react";
import { render, screen } from "@testing-library/react-native";
import { MacroTargets } from "./MacroTargets";

describe("MacroTargets", () => {
  it("renders all three macro pills", () => {
    render(<MacroTargets protein={185} carbs={160} fat={55} />);
    expect(screen.getByText("Protein")).toBeTruthy();
    expect(screen.getByText("Carbs")).toBeTruthy();
    expect(screen.getByText("Fat")).toBeTruthy();
  });

  it("renders the correct values", () => {
    render(<MacroTargets protein={200} carbs={100} fat={60} />);
    // values live in nested Text nodes; match via regex
    expect(screen.getByText(/200/)).toBeTruthy();
    expect(screen.getByText(/100/)).toBeTruthy();
    expect(screen.getByText(/60/)).toBeTruthy();
  });
});
