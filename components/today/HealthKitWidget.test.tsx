import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { HealthKitWidget } from "./HealthKitWidget";

const base = {
  ready: true,
  weightKg: null,
  weightInput: "",
  onWeightInputChange: jest.fn(),
  onLogWeight: jest.fn(),
};

describe("HealthKitWidget", () => {
  it("shows green indicator when ready", () => {
    render(<HealthKitWidget {...base} ready={true} />);
    expect(screen.getByText("HealthKit")).toBeTruthy();
  });

  it("calls onLogWeight when Log pressed", () => {
    const onLogWeight = jest.fn();
    render(<HealthKitWidget {...base} onLogWeight={onLogWeight} />);
    fireEvent.press(screen.getByText("Log"));
    expect(onLogWeight).toHaveBeenCalledTimes(1);
  });

  it("shows last weight when weightKg is set", () => {
    render(<HealthKitWidget {...base} weightKg={85} />);
    expect(screen.getByText(/85\.0 kg/)).toBeTruthy();
  });

  it("hides last weight when weightKg is null", () => {
    render(<HealthKitWidget {...base} weightKg={null} />);
    expect(screen.queryByText(/Last HK weight/)).toBeNull();
  });

  it("calls onWeightInputChange on text change", () => {
    const onWeightInputChange = jest.fn();
    render(<HealthKitWidget {...base} onWeightInputChange={onWeightInputChange} />);
    fireEvent.changeText(screen.getByPlaceholderText("Weight (kg)"), "80");
    expect(onWeightInputChange).toHaveBeenCalledWith("80");
  });
});
