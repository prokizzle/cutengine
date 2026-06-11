import { kgToLbs, lbsToKg, formatWeight, KG_TO_LBS } from "./weight";

describe("kgToLbs", () => {
  it("converts 0 correctly", () => {
    expect(kgToLbs(0)).toBe(0);
  });
  it("converts 1 kg to ~2.205 lbs", () => {
    expect(kgToLbs(1)).toBeCloseTo(2.20462, 4);
  });
  it("converts 100 kg", () => {
    expect(kgToLbs(100)).toBeCloseTo(220.462, 2);
  });
});

describe("lbsToKg", () => {
  it("converts 0 correctly", () => {
    expect(lbsToKg(0)).toBe(0);
  });
  it("is inverse of kgToLbs", () => {
    const kg = 85;
    expect(lbsToKg(kgToLbs(kg))).toBeCloseTo(kg, 5);
  });
});

describe("formatWeight", () => {
  it("defaults to 1 decimal", () => {
    expect(formatWeight(188.4)).toBe("188.4");
  });
  it("respects custom decimals", () => {
    expect(formatWeight(188.4444, 2)).toBe("188.44");
  });
});

describe("KG_TO_LBS", () => {
  it("is 2.20462", () => {
    expect(KG_TO_LBS).toBe(2.20462);
  });
});
