import { act, renderHook } from "@testing-library/react-native";
import { useHealthKit } from "./useHealthKit";

jest.mock("../lib/healthKit", () => ({
  initHealthKit: jest.fn(),
  readLatestWeight: jest.fn(),
  writeWeight: jest.fn(),
}));

jest.mock("react-native", () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: "ios" },
}));

import * as healthKit from "../lib/healthKit";
import { Alert } from "react-native";

const mockInit = healthKit.initHealthKit as jest.Mock;
const mockRead = healthKit.readLatestWeight as jest.Mock;
const mockWrite = healthKit.writeWeight as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useHealthKit", () => {
  it("sets ready=true and reads weight when init succeeds", async () => {
    mockInit.mockResolvedValue(true);
    mockRead.mockResolvedValue(80);

    const { result } = renderHook(() => useHealthKit());

    await act(async () => {});

    expect(result.current.ready).toBe(true);
    expect(result.current.weightKg).toBe(80);
    expect(result.current.weightLbs).toBeCloseTo(80 * 2.20462, 3);
  });

  it("sets ready=false when init fails", async () => {
    mockInit.mockResolvedValue(false);

    const { result } = renderHook(() => useHealthKit());
    await act(async () => {});

    expect(result.current.ready).toBe(false);
    expect(result.current.weightKg).toBeNull();
  });

  it("logWeight alerts on invalid input", async () => {
    mockInit.mockResolvedValue(true);
    mockRead.mockResolvedValue(null);

    const { result } = renderHook(() => useHealthKit());
    await act(async () => {});

    await act(async () => {
      result.current.setWeightInput("abc");
    });
    await act(async () => {
      await result.current.logWeight();
    });

    expect(mockAlert).toHaveBeenCalledWith("Invalid weight", expect.any(String));
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("logWeight writes and updates weightKg on valid input", async () => {
    mockInit.mockResolvedValue(true);
    mockRead.mockResolvedValue(75);
    mockWrite.mockResolvedValue(undefined);

    const { result } = renderHook(() => useHealthKit());
    await act(async () => {});

    await act(async () => {
      result.current.setWeightInput("85");
    });
    await act(async () => {
      await result.current.logWeight();
    });

    expect(mockWrite).toHaveBeenCalledWith(85);
    expect(result.current.weightKg).toBe(85);
    expect(result.current.weightInput).toBe("");
  });

  it("logWeight alerts on write error", async () => {
    mockInit.mockResolvedValue(true);
    mockRead.mockResolvedValue(null);
    mockWrite.mockRejectedValue(new Error("HK unavailable"));

    const { result } = renderHook(() => useHealthKit());
    await act(async () => {});

    await act(async () => {
      result.current.setWeightInput("80");
    });
    await act(async () => {
      await result.current.logWeight();
    });

    expect(mockAlert).toHaveBeenCalledWith("Error", expect.any(String));
  });
});
