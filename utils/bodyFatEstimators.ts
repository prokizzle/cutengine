function percentToFraction(percent: number): number | null {
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return null;
  return percent / 100;
}

export function estimateMaleNavyBodyFatFraction(
  waistInches: number,
  neckInches: number,
  heightInches: number,
): number | null {
  if (
    !Number.isFinite(waistInches) ||
    !Number.isFinite(neckInches) ||
    !Number.isFinite(heightInches) ||
    waistInches <= neckInches ||
    neckInches <= 0 ||
    heightInches <= 0
  ) {
    return null;
  }

  const percent =
    86.01 * Math.log10(waistInches - neckInches) -
    70.041 * Math.log10(heightInches) +
    36.76;
  return percentToFraction(percent);
}

export function estimateAbdominalCaliperBodyFatFraction(
  caliperMillimeters: number,
): number | null {
  if (!Number.isFinite(caliperMillimeters) || caliperMillimeters <= 0)
    return null;
  return percentToFraction(caliperMillimeters * 1.05);
}
