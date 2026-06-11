import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TimelineHero } from "./TimelineHero";

const base = {
  date: new Date("2026-06-11"),
  calorieTarget: 2150,
  calorieDelta: -85,
  dosedCount: 1,
  dosedTotal: 6,
  bodyWeight: 188.4,
  weightDelta: -2.3,
};

describe("TimelineHero", () => {
  it("renders calorie target", () => {
    render(<TimelineHero {...base} />);
    expect(screen.getByText("2,150")).toBeTruthy();
  });

  it("renders dose progress", () => {
    render(<TimelineHero {...base} />);
    expect(screen.getByText("1/6 dosed")).toBeTruthy();
  });

  it("renders weight", () => {
    render(<TimelineHero {...base} />);
    expect(screen.getByText(/188\.4 lb/)).toBeTruthy();
  });

  it("shows positive delta with + sign", () => {
    render(<TimelineHero {...base} calorieDelta={100} />);
    expect(screen.getByText("+100")).toBeTruthy();
  });

  it("hides delta when calorieDelta is 0", () => {
    render(<TimelineHero {...base} calorieDelta={0} />);
    expect(screen.queryByText("+0")).toBeNull();
    expect(screen.queryByText("-0")).toBeNull();
  });
});
