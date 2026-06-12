import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PhaseSettings } from "./PhaseSettings";
import { SURPLUS_TIERS } from "../../utils/calorieTargets";
import type { UserProfile } from "../../modules/expo-cycle-store/src/userProfile";

const cutProfile: UserProfile = {
  id: "user-profile-singleton",
  currentPhase: "cut",
  phaseStartDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  macroOverrides: {},
  targetWeightDeltaPerWeekKg: -0.5,
};

const bulkProfile: UserProfile = {
  ...cutProfile,
  currentPhase: "bulk",
  targetWeightDeltaPerWeekKg: SURPLUS_TIERS[0].weeklyDeltaKg,
};

const noop = {
  onSwitchPhase: jest.fn(),
  onSelectWeeklyDelta: jest.fn(),
  onEditMacros: jest.fn(),
  onRequirePro: jest.fn(),
};

describe("PhaseSettings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the current phase duration", () => {
    render(<PhaseSettings profile={cutProfile} entitled {...noop} />);
    expect(screen.getByText("Cutting for 3 weeks")).toBeTruthy();
  });

  it("marks bulk and maintenance as Pro when not entitled", () => {
    render(<PhaseSettings profile={cutProfile} entitled={false} {...noop} />);
    expect(screen.getByLabelText("Bulk phase, requires Pro")).toBeTruthy();
    expect(screen.getByLabelText("Maintenance phase, requires Pro")).toBeTruthy();
  });

  it("routes locked phases to the paywall instead of switching", () => {
    render(<PhaseSettings profile={cutProfile} entitled={false} {...noop} />);
    fireEvent.press(screen.getByLabelText("Bulk phase, requires Pro"));
    expect(noop.onRequirePro).toHaveBeenCalled();
    expect(noop.onSwitchPhase).not.toHaveBeenCalled();
  });

  it("confirms before switching phase, then switches", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_t, _m, buttons) => {
      buttons?.find((b) => b.text === "Switch")?.onPress?.();
    });
    render(<PhaseSettings profile={cutProfile} entitled {...noop} />);
    fireEvent.press(screen.getByLabelText("Bulk phase"));
    expect(alertSpy).toHaveBeenCalledWith(
      "Switch to Bulk mode?",
      expect.stringContaining("progress will be saved"),
      expect.anything(),
    );
    expect(noop.onSwitchPhase).toHaveBeenCalledWith("bulk");
    alertSpy.mockRestore();
  });

  it("shows surplus tiers in bulk mode and selects one", () => {
    render(<PhaseSettings profile={bulkProfile} entitled {...noop} />);
    fireEvent.press(screen.getByLabelText("Dreamer bulk, 1 pounds per week"));
    expect(noop.onSelectWeeklyDelta).toHaveBeenCalledWith(SURPLUS_TIERS[3].weeklyDeltaKg);
  });

  it("hides cut/bulk pace tiers in maintenance mode", () => {
    render(
      <PhaseSettings
        profile={{ ...cutProfile, currentPhase: "maintenance", targetWeightDeltaPerWeekKg: 0 }}
        entitled
        {...noop}
      />,
    );
    expect(screen.queryByText("Lean bulk")).toBeNull();
    expect(screen.queryByText("Standard")).toBeNull();
    expect(screen.getByText(/targets your TDEE/)).toBeTruthy();
  });

  it("saves a valid macro override for the active phase", () => {
    render(<PhaseSettings profile={cutProfile} entitled {...noop} />);
    fireEvent.changeText(screen.getByLabelText("PROTEIN percent"), "45");
    fireEvent.changeText(screen.getByLabelText("CARBS percent"), "35");
    fireEvent.changeText(screen.getByLabelText("FAT percent"), "20");
    fireEvent.press(screen.getByLabelText("Save macro split"));
    expect(noop.onEditMacros).toHaveBeenCalledWith("cut", { protein: 0.45, carb: 0.35, fat: 0.2 });
  });

  it("rejects a macro split that does not sum to 100", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    render(<PhaseSettings profile={cutProfile} entitled {...noop} />);
    fireEvent.changeText(screen.getByLabelText("PROTEIN percent"), "60");
    fireEvent.press(screen.getByLabelText("Save macro split"));
    expect(alertSpy).toHaveBeenCalledWith("Invalid split", expect.stringContaining("100%"));
    expect(noop.onEditMacros).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("resets the macro override to default", () => {
    render(
      <PhaseSettings
        profile={{ ...cutProfile, macroOverrides: { cut: { protein: 0.5, carb: 0.25, fat: 0.25 } } }}
        entitled
        {...noop}
      />,
    );
    fireEvent.press(screen.getByLabelText("Reset macro split to default"));
    expect(noop.onEditMacros).toHaveBeenCalledWith("cut", null);
  });
});
