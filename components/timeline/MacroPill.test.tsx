import React from "react";
import { render, screen } from "@testing-library/react-native";
import { MacroPill } from "./MacroPill";

describe("MacroPill", () => {
  it("renders label and value", () => {
    render(<MacroPill label="Protein" value={185} unit="g" color="#ff3b30" />);
    expect(screen.getByText("Protein")).toBeTruthy();
    // value + unit are in a nested Text; match combined accessible text
    expect(screen.getByText(/185/)).toBeTruthy();
    expect(screen.getByText(/ g/)).toBeTruthy();
  });
});
