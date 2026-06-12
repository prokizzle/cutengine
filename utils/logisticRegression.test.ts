import { predictProbability, trainLogistic } from "./logisticRegression";

describe("predictProbability", () => {
  it("is 0.5 for a zero model", () => {
    expect(predictProbability({ weights: [0, 0], bias: 0 }, [1, 1])).toBe(0.5);
  });

  it("stays within (0, 1) for extreme inputs", () => {
    const model = { weights: [100], bias: 0 };
    expect(predictProbability(model, [50])).toBeLessThanOrEqual(1);
    expect(predictProbability(model, [-50])).toBeGreaterThanOrEqual(0);
  });
});

describe("trainLogistic", () => {
  it("throws on an empty training set", () => {
    expect(() => trainLogistic([], [])).toThrow();
  });

  it("learns a linearly separable pattern", () => {
    // y = 1 iff first feature is set (e.g. "it's Saturday").
    const xs = [
      [1, 0], [1, 1], [1, 0], [1, 1],
      [0, 0], [0, 1], [0, 0], [0, 1],
    ];
    const ys = [1, 1, 1, 1, 0, 0, 0, 0];
    const model = trainLogistic(xs, ys, { epochs: 2000 });
    expect(predictProbability(model, [1, 0])).toBeGreaterThan(0.8);
    expect(predictProbability(model, [0, 0])).toBeLessThan(0.2);
  });

  it("is deterministic for the same data", () => {
    const xs = [[1, 0], [0, 1], [1, 1], [0, 0]];
    const ys = [1, 0, 1, 0];
    expect(trainLogistic(xs, ys)).toEqual(trainLogistic(xs, ys));
  });

  it("positiveWeight raises predicted probability on rare positives", () => {
    const xs = Array.from({ length: 20 }, (_, i) => [i % 10 === 0 ? 1 : 0]);
    const ys = xs.map((x) => x[0]);
    const unweighted = trainLogistic(xs, ys);
    const weighted = trainLogistic(xs, ys, { positiveWeight: 4 });
    expect(predictProbability(weighted, [1])).toBeGreaterThan(
      predictProbability(unweighted, [1]),
    );
  });
});
