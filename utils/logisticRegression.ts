// CUTIOS-12 — minimal logistic regression trained on-device. v1 used a
// bundled CreateML .mlmodel; v2 trains in TypeScript instead so the model
// works in Expo Go, on every platform, retrains as data accrues, and is unit
// testable. Full-batch gradient descent with zero-init weights keeps training
// deterministic for a given dataset.

export interface LogisticModel {
  weights: number[];
  bias: number;
}

export interface TrainOptions {
  epochs?: number;
  learningRate?: number;
  /** L2 regularization strength — keeps rare one-hot features from exploding. */
  l2?: number;
  /** Loss weight on positive (miss) examples to offset class imbalance. */
  positiveWeight?: number;
}

const DEFAULTS: Required<TrainOptions> = {
  epochs: 400,
  learningRate: 0.5,
  l2: 0.01,
  positiveWeight: 1,
};

function sigmoid(z: number): number {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const ez = Math.exp(z);
  return ez / (1 + ez);
}

export function predictProbability(model: LogisticModel, x: number[]): number {
  let z = model.bias;
  for (let i = 0; i < model.weights.length; i++) z += model.weights[i] * (x[i] ?? 0);
  return sigmoid(z);
}

export function trainLogistic(
  xs: number[][],
  ys: number[],
  opts: TrainOptions = {},
): LogisticModel {
  const { epochs, learningRate, l2, positiveWeight } = { ...DEFAULTS, ...opts };
  if (xs.length === 0) throw new Error("trainLogistic: empty training set");
  const dim = xs[0].length;
  const weights = new Array<number>(dim).fill(0);
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array<number>(dim).fill(0);
    let gradB = 0;
    for (let n = 0; n < xs.length; n++) {
      const x = xs[n];
      const y = ys[n];
      const sampleWeight = y === 1 ? positiveWeight : 1;
      const error = (predictProbability({ weights, bias }, x) - y) * sampleWeight;
      for (let i = 0; i < dim; i++) gradW[i] += error * x[i];
      gradB += error;
    }
    const scale = learningRate / xs.length;
    for (let i = 0; i < dim; i++) {
      weights[i] -= scale * (gradW[i] + l2 * weights[i]);
    }
    bias -= scale * gradB;
  }

  return { weights, bias };
}
