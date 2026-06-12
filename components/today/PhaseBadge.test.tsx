import React from "react";
import { render, screen } from "@testing-library/react-native";
import { PhaseBadge } from "./PhaseBadge";

describe("PhaseBadge", () => {
  it("renders the phase in uppercase", () => {
    render(<PhaseBadge phase="bulk" />);
    expect(screen.getByText(/BULK/)).toBeTruthy();
  });

  it("renders the detail when given", () => {
    render(<PhaseBadge phase="cut" detail="Week 8" />);
    expect(screen.getByText("Week 8")).toBeTruthy();
  });
});
