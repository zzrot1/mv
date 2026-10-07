import type { FilterFn, FilterVariant } from "./types";
import { isEmptyValue, normalizeText, toNumber, toText } from "./values";

const includesText: FilterFn<unknown> = (cellValue, filterValue) =>
  normalizeText(cellValue).includes(normalizeText(filterValue));

const equals: FilterFn<unknown> = (cellValue, filterValue) => {
  const expected = toText(filterValue);
  const values = Array.isArray(cellValue) ? cellValue : [cellValue];

  return values.some((value) => toText(value) === expected);
};

const inNumberRange: FilterFn<unknown> = (cellValue, filterValue) => {
  const value = toNumber(cellValue);
  const [min, max] = Array.isArray(filterValue) ? filterValue.map(toNumber) : [];

  if (value === undefined) {
    return false;
  }

  return (min === undefined || value >= min) && (max === undefined || value <= max);
};

const isTruthy: FilterFn<unknown> = (cellValue) => Boolean(cellValue);

export const filterFns = { equals, includesText, inNumberRange, isTruthy };

export const columnFilterFns: Readonly<Record<FilterVariant, FilterFn<unknown>>> = {
  "number-range": inNumberRange,
  select: equals,
  text: includesText,
};

export function isActiveFilterValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => !isEmptyValue(item));
  }

  return !isEmptyValue(value) && value !== false;
}
