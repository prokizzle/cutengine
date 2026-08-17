import {
  estimateAbdominalCaliperBodyFatFraction,
  estimateMaleNavyBodyFatFraction,
} from "./bodyFatEstimators";

describe("estimateMaleNavyBodyFatFraction", () => {
  it("ports the legacy male Navy reference estimate as a fraction", () => {
    expect(estimateMaleNavyBodyFatFraction(34, 15, 70)).toBeCloseTo(0.1755, 3);
  });

  it("returns null when the circumference difference cannot be logged", () => {
    expect(estimateMaleNavyBodyFatFraction(15, 15, 70)).toBeNull();
    expect(estimateMaleNavyBodyFatFraction(14, 15, 70)).toBeNull();
  });

  it("returns null for non-finite or physically impossible estimates", () => {
    expect(estimateMaleNavyBodyFatFraction(Number.NaN, 15, 70)).toBeNull();
    expect(estimateMaleNavyBodyFatFraction(34, 15, 0)).toBeNull();
    expect(estimateMaleNavyBodyFatFraction(16, 15, 100)).toBeNull();
  });
});

describe("estimateAbdominalCaliperBodyFatFraction", () => {
  it("ports the legacy abdominal-caliper reference estimate as a fraction", () => {
    expect(estimateAbdominalCaliperBodyFatFraction(18)).toBeCloseTo(0.189);
  });

  it("returns null for invalid or physically impossible estimates", () => {
    expect(estimateAbdominalCaliperBodyFatFraction(0)).toBeNull();
    expect(
      estimateAbdominalCaliperBodyFatFraction(Number.POSITIVE_INFINITY),
    ).toBeNull();
    expect(estimateAbdominalCaliperBodyFatFraction(100)).toBeNull();
  });
});
