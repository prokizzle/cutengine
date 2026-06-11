import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaywallFooter } from "./PaywallFooter";

describe("PaywallFooter", () => {
  it("shows restore button", () => {
    render(<PaywallFooter restoring={false} onRestore={jest.fn()} />);
    expect(screen.getByText("Restore Purchases")).toBeTruthy();
  });

  it("shows restoring state", () => {
    render(<PaywallFooter restoring={true} onRestore={jest.fn()} />);
    expect(screen.getByText("Restoring...")).toBeTruthy();
  });

  it("calls onRestore when pressed", () => {
    const onRestore = jest.fn();
    render(<PaywallFooter restoring={false} onRestore={onRestore} />);
    fireEvent.press(screen.getByText("Restore Purchases"));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it("renders legal copy", () => {
    render(<PaywallFooter restoring={false} onRestore={jest.fn()} />);
    expect(screen.getByText(/Payment charged to your Apple ID/)).toBeTruthy();
  });
});
