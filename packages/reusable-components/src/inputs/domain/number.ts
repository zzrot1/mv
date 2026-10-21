export type NumberBounds = { min?: number; max?: number };

export type StepOptions = NumberBounds & {
  direction: 1 | -1;
  step: number;
  precision?: number;
};

const PARTIAL_NUMBER = /^-?\d*(?:[.,]\d*)?$/;
const COMPLETE_NUMBER = /^-?(?:\d+\.?\d*|\.\d+)$/;

export function isPartialNumber(text: string) {
  return PARTIAL_NUMBER.test(text.trim());
}

export function parseNumber(text: string): number | null {
  const normalized = text.trim().replace(",", ".");

  if (!COMPLETE_NUMBER.test(normalized)) {
    return null;
  }

  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
}

export function countDecimals(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const [mantissa, exponent = "0"] = String(value).toLowerCase().split("e");
  const fractionDigits = mantissa.split(".")[1]?.length ?? 0;

  return Math.max(0, fractionDigits - Number(exponent));
}

export function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;

  return (Math.sign(value) * Math.round(Number((Math.abs(value) * factor).toPrecision(15)))) / factor;
}

export function clampNumber(value: number, { max, min }: NumberBounds) {
  if (min !== undefined && value < min) {
    return min;
  }

  return max !== undefined && value > max ? max : value;
}

export function stepNumber(
  value: number | null,
  { direction, max, min, precision, step }: StepOptions,
): number {
  if (value === null) {
    return clampNumber(min ?? 0, { max, min });
  }

  const decimals = precision ?? Math.max(countDecimals(step), countDecimals(value));

  return clampNumber(roundTo(value + direction * step, decimals), { max, min });
}

export function normalizeNumber(
  value: number | null,
  { max, min, precision }: NumberBounds & { precision?: number },
): number | null {
  if (value === null) {
    return null;
  }

  return clampNumber(precision === undefined ? value : roundTo(value, precision), { max, min });
}

export function formatNumber(value: number | null, precision?: number) {
  if (value === null) {
    return "";
  }

  return precision === undefined ? String(value) : roundTo(value, precision).toFixed(precision);
}
