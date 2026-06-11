import React from "react";
import { render, screen } from "@testing-library/react-native";
import { DoseRow } from "./DoseRow";
import type { DoseEvent } from "../../types/timeline";

const base: DoseEvent = {
  id: "1",
  name: "Creatine",
  dose: 5,
  unit: "g",
  timeOfDay: "morning",
  sortOrder: 0,
  taken: false,
};

describe("DoseRow", () => {
  it("renders event name and dose", () => {
    render(<DoseRow event={base} />);
    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(screen.getByText("5 g")).toBeTruthy();
  });

  it("shows checkmark when taken", () => {
    render(<DoseRow event={{ ...base, taken: true }} />);
    expect(screen.getByText("✓")).toBeTruthy();
  });

  it("renders regimen chip when present", () => {
    render(
      <DoseRow event={{ ...base, regimen: "Cycle A", weekLabel: "week 3/12" }} />,
    );
    expect(screen.getByText("Cycle A · week 3/12")).toBeTruthy();
  });

  it("renders regimen without weekLabel", () => {
    render(<DoseRow event={{ ...base, regimen: "Cycle B" }} />);
    expect(screen.getByText("Cycle B")).toBeTruthy();
  });

  it("omits dose line when dose is undefined", () => {
    render(<DoseRow event={{ ...base, dose: undefined, unit: undefined }} />);
    expect(screen.queryByText(/g$/)).toBeNull();
  });
});
