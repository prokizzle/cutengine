import React from "react";
import { render, screen } from "@testing-library/react-native";
import { PaywallHeader } from "./PaywallHeader";

describe("PaywallHeader", () => {
  it("renders app name", () => {
    render(<PaywallHeader />);
    expect(screen.getByText("CutEngine Pro")).toBeTruthy();
  });

  it("renders subtitle copy", () => {
    render(<PaywallHeader />);
    expect(screen.getByText(/Advanced protocol tracking/)).toBeTruthy();
  });
});
