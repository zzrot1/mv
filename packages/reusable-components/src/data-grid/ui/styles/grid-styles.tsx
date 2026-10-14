import { defaultGridStyles } from "./default-styles";

export function GridStyles() {
  return (
    <style href="reusable-components/data-grid" precedence="reusable-components">
      {defaultGridStyles}
    </style>
  );
}
