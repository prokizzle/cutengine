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

  it("colors a deficit green during a cut", () => {
    render(<TimelineHero {...base} phase="cut" calorieDelta={-85} />);
    expect(screen.getByText("-85").props.className).toContain("text-positive");
  });

  it("colors a deficit red during a bulk (missing the surplus)", () => {
    render(<TimelineHero {...base} phase="bulk" calorieDelta={-85} />);
    expect(screen.getByText("-85").props.className).toContain("text-warning");
  });

  it("colors a surplus green during a bulk", () => {
    render(<TimelineHero {...base} phase="bulk" calorieDelta={120} />);
    expect(screen.getByText("+120").props.className).toContain("text-positive");
  });

  it("treats small deltas as on-plan during maintenance", () => {
    render(<TimelineHero {...base} phase="maintenance" calorieDelta={50} />);
    expect(screen.getByText("+50").props.className).toContain("text-positive");
  });

  it("colors weight gain green during a bulk", () => {
    render(<TimelineHero {...base} phase="bulk" weightDelta={1.2} />);
    expect(screen.getByText("+1.2").props.className).toContain("text-positive");
  });
});
