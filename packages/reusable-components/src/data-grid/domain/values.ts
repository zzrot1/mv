const COMBINING_MARKS = /[̀-ͯ]/g;

export function isEmptyValue(value: unknown) {
  return value === null || value === undefined || value === "";
}

export function toText(value: unknown): string {
  if (isEmptyValue(value)) {
    return "";
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }

  return typeof value === "object" ? "" : String(value);
}

export function normalizeText(value: unknown) {
  return toText(value)
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim();
}

export function toNumber(value: unknown) {
  if (isEmptyValue(value)) {
    return undefined;
  }

  const number = typeof value === "number" ? value : Number(value);

  return Number.isFinite(number) ? number : undefined;
}
