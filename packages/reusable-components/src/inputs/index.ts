export {
  formatNumber,
  normalizeNumber,
  parseNumber,
  stepNumber,
  type NumberBounds,
  type StepOptions,
} from "./domain/number";
export {
  composeValidators,
  email,
  isBlank,
  maxLength,
  minLength,
  pattern,
  range,
  required,
  type Validator,
} from "./domain/validation";

export { useInputAppearance, type InputAppearance, type InputSize, type InputVariant } from "./ui/appearance";
export {
  defaultInputLabels,
  InputsConfigProvider,
  useFieldControl,
  type InputLabels,
  type InputsConfig,
} from "./ui/context";
export { useControllableState } from "../shared/use-controllable-state";
export { useNumberInput, type UseNumberInputOptions } from "./ui/use-number-input";

export { Checkbox, Switch, type CheckboxProps, type CheckboxSlot, type SwitchProps } from "./ui/components/checkbox";
export { Field, type FieldProps, type FieldSlot } from "./ui/components/field";
export { NumberInput, type NumberInputProps, type NumberInputSlot } from "./ui/components/number-input";
export { PasswordInput, type PasswordInputProps, type PasswordInputSlot } from "./ui/components/password-input";
export { SearchInput, type SearchInputProps, type SearchInputSlot } from "./ui/components/search-input";
export {
  Select,
  type SelectOption,
  type SelectOptionGroup,
  type SelectProps,
  type SelectSlot,
} from "./ui/components/select";
export { TextInput, type TextInputProps, type TextInputSlot } from "./ui/components/text-input";
export { Textarea, type TextareaProps, type TextareaSlot } from "./ui/components/textarea";
