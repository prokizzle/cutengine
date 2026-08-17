jest.mock("../modules/expo-healthkit/src/index", () => ({
  __esModule: true,
  default: {
    requestAuthorization: jest.fn(),
    saveWeight: jest.fn(),
    getLatestWeight: jest.fn(),
    getActiveEnergyToday: jest.fn(),
    getWeightSamples: jest.fn(),
    getLatestBodyFat: jest.fn(),
    getBodyFatSamples: jest.fn(),
  },
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import ExpoHealthKit from "../modules/expo-healthkit/src";
import {
  initHealthKit,
  readBodyFatHistory,
  readLatestBodyFat,
} from "./healthKit";

const mockRequestAuthorization =
  ExpoHealthKit.requestAuthorization as jest.Mock;
const mockGetLatestBodyFat = ExpoHealthKit.getLatestBodyFat as jest.Mock;
const mockGetBodyFatSamples = ExpoHealthKit.getBodyFatSamples as jest.Mock;
const mockCaptureException = Sentry.captureException as jest.Mock;

const setPlatform = (os: string) => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
};

beforeEach(() => {
  jest.clearAllMocks();
  setPlatform("ios");
});

describe("body-fat HealthKit reads", () => {
  it("requests body-fat read access without adding write access", async () => {
    mockRequestAuthorization.mockResolvedValue(true);

    await initHealthKit();

    expect(mockRequestAuthorization).toHaveBeenCalledWith(
      expect.arrayContaining(["bodyFatPercentage"]),
      ["bodyMass"],
    );
  });

  it("maps the latest fraction and preserves an absent sample", async () => {
    mockGetLatestBodyFat
      .mockResolvedValueOnce({
        dateISO: "2026-08-01T12:00:00.000Z",
        valueFraction: 0.184,
      })
      .mockResolvedValueOnce(null);

    await expect(readLatestBodyFat()).resolves.toEqual({
      date: "2026-08-01T12:00:00.000Z",
      fraction: 0.184,
    });
    await expect(readLatestBodyFat()).resolves.toBeNull();
  });

  it("queries an injected trailing window and maps ascending samples", async () => {
    const now = new Date("2026-08-17T12:00:00.000Z");
    mockGetBodyFatSamples.mockResolvedValue([
      { dateISO: "2026-08-01T12:00:00.000Z", valueFraction: 0.19 },
      { dateISO: "2026-08-10T12:00:00.000Z", valueFraction: 0.185 },
    ]);

    await expect(readBodyFatHistory(30, now)).resolves.toEqual([
      { date: "2026-08-01T12:00:00.000Z", fraction: 0.19 },
      { date: "2026-08-10T12:00:00.000Z", fraction: 0.185 },
    ]);
    expect(mockGetBodyFatSamples).toHaveBeenCalledWith(
      "2026-07-18T12:00:00.000Z",
      "2026-08-17T12:00:00.000Z",
    );
  });

  it("returns neutral values without calling the iOS module", async () => {
    setPlatform("android");

    await expect(readLatestBodyFat()).resolves.toBeNull();
    await expect(readBodyFatHistory()).resolves.toEqual([]);
    expect(mockGetLatestBodyFat).not.toHaveBeenCalled();
    expect(mockGetBodyFatSamples).not.toHaveBeenCalled();
  });

  it("reports native read failures and returns neutral values", async () => {
    const error = new Error("HealthKit unavailable");
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockGetLatestBodyFat.mockRejectedValue(error);
    mockGetBodyFatSamples.mockRejectedValue(error);

    await expect(readLatestBodyFat()).resolves.toBeNull();
    await expect(readBodyFatHistory()).resolves.toEqual([]);
    expect(mockCaptureException).toHaveBeenCalledTimes(2);
    expect(mockCaptureException).toHaveBeenNthCalledWith(1, error);
    expect(mockCaptureException).toHaveBeenNthCalledWith(2, error);

    consoleError.mockRestore();
  });
});
