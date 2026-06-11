import React from "react";
import { render, screen } from "@testing-library/react-native";
import { BucketSection } from "./BucketSection";
import type { DoseEvent } from "../../types/timeline";

const items: DoseEvent[] = [
  { id: "1", name: "Creatine", timeOfDay: "morning", sortOrder: 0, taken: false },
  { id: "2", name: "Vitamin D", timeOfDay: "morning", sortOrder: 1, taken: true },
];

describe("BucketSection", () => {
  it("renders bucket label for known tod", () => {
    render(<BucketSection tod="morning" items={items} />);
    expect(screen.getByText("MORNING")).toBeTruthy();
  });

  it("uppercases unknown tod as label", () => {
    render(<BucketSection tod="custom" items={items} />);
    expect(screen.getByText("CUSTOM")).toBeTruthy();
  });

  it("renders all items", () => {
    render(<BucketSection tod="morning" items={items} />);
    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(screen.getByText("Vitamin D")).toBeTruthy();
  });
});
