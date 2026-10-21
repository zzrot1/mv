import type { NumberBounds } from "./number";

/**
 * Returns the error message, or `undefined` when the value is fine. Messages are
 * arguments, so they can come from a translation. Only `required` rejects an
 * empty value; the other validators let it through.
 */
export type Validator<TValue> = (value: TValue) => string | undefined;

export function composeValidators<TValue>(
  ...validators: readonly Validator<TValue>[]
): Validator<TValue> {
  return (value) => {
    for (const validate of validators) {
      const error = validate(value);

      if (error) {
        return error;
      }
    }

    return undefined;
  };
}

export function isBlank(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    (typeof value === "string" && value.trim() === "")
  );
}

export function required(message: string): Validator<unknown> {
  return (value) => (isBlank(value) ? message : undefined);
}

export function minLength(min: number, message: string): Validator<string> {
  return (value) => (value && value.length < min ? message : undefined);
}

export function maxLength(max: number, message: string): Validator<string> {
  return (value) => (value && value.length > max ? message : undefined);
}

export function pattern(regex: RegExp, message: string): Validator<string> {
  return (value) => {
    regex.lastIndex = 0;

    return value && !regex.test(value) ? message : undefined;
  };
}

export function email(message: string): Validator<string> {
  const valid = pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message);

  return (value) => (value && value.length > 254 ? message : valid(value));
}

export function range({ max, min }: NumberBounds, message: string): Validator<number | null> {
  return (value) =>
    value !== null &&
    ((min !== undefined && value < min) || (max !== undefined && value > max))
      ? message
      : undefined;
}
