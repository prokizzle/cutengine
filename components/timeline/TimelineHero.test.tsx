import React from "react";
import { StyleSheet } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { TimelineHero } from "./TimelineHero";

const POSITIVE = "#34c759";
const WARNING = "#ff453a";

function colorOf(node: { props: { style?: unknown } }): string | undefined {
  const flat = StyleSheet.flatten(node.props.style) as { color?: string } | undefined;
  return flat?.color;
}

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
    expect(colorOf(screen.getByText("-85"))).toBe(POSITIVE);
  });

  it("colors a deficit red during a bulk (missing the surplus)", () => {
    render(<TimelineHero {...base} phase="bulk" calorieDelta={-85} />);
    expect(colorOf(screen.getByText("-85"))).toBe(WARNING);
  });

  it("colors a surplus green during a bulk", () => {
    render(<TimelineHero {...base} phase="bulk" calorieDelta={120} />);
    expect(colorOf(screen.getByText("+120"))).toBe(POSITIVE);
  });

  it("treats small deltas as on-plan during maintenance", () => {
    render(<TimelineHero {...base} phase="maintenance" calorieDelta={50} />);
    expect(colorOf(screen.getByText("+50"))).toBe(POSITIVE);
  });

  it("colors weight gain green during a bulk", () => {
    render(<TimelineHero {...base} phase="bulk" weightDelta={1.2} />);
    expect(colorOf(screen.getByText("+1.2"))).toBe(POSITIVE);
  });
});
