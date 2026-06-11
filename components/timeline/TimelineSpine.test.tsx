import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TimelineSpine } from "./TimelineSpine";
import type { DoseEvent } from "../../types/timeline";

const events: DoseEvent[] = [
  { id: "1", name: "Creatine", timeOfDay: "morning", sortOrder: 0, taken: true },
  { id: "2", name: "Magnesium", timeOfDay: "bedtime", sortOrder: 0, taken: false },
];

describe("TimelineSpine", () => {
  it("renders bucket labels for present time-of-day slots", () => {
    render(<TimelineSpine events={events} />);
    expect(screen.getByText("MORNING")).toBeTruthy();
    expect(screen.getByText("BEDTIME")).toBeTruthy();
  });

  it("omits empty buckets", () => {
    render(<TimelineSpine events={events} />);
    expect(screen.queryByText("MIDDAY")).toBeNull();
  });

  it("renders event names", () => {
    render(<TimelineSpine events={events} />);
    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(screen.getByText("Magnesium")).toBeTruthy();
  });

  it("renders empty without crashing", () => {
    render(<TimelineSpine events={[]} />);
  });
});
