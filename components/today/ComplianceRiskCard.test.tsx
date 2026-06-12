import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ComplianceRiskCard } from "./ComplianceRiskCard";
import type { MissPrediction } from "../../utils/compliancePredictor";

const high: MissPrediction = { probability: 0.8, level: "high", source: "model" };
const moderate: MissPrediction = { probability: 0.4, level: "moderate", source: "heuristic" };
const low: MissPrediction = { probability: 0.1, level: "low", source: "model" };

describe("ComplianceRiskCard", () => {
  it("renders high-risk copy", () => {
    render(<ComplianceRiskCard prediction={high} />);
    expect(screen.getByText(/usually slip/)).toBeTruthy();
  });

  it("renders moderate-risk copy", () => {
    render(<ComplianceRiskCard prediction={moderate} />);
    expect(screen.getByText(/at some risk/)).toBeTruthy();
  });

  it("renders nothing for low risk", () => {
    render(<ComplianceRiskCard prediction={low} />);
    expect(screen.queryByText(/COMPLIANCE INSIGHT/)).toBeNull();
  });

  it("calls onDismiss", () => {
    const onDismiss = jest.fn();
    render(<ComplianceRiskCard prediction={high} onDismiss={onDismiss} />);
    fireEvent.press(screen.getByLabelText("Dismiss compliance insight"));
    expect(onDismiss).toHaveBeenCalled();
  });
});
