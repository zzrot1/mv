import { defaultGridStyles } from "./default-styles";

// React hoists this into <head> once, however many grids are on the page.
export function GridStyles() {
  return (
    <style href="reusable-components/data-grid" precedence="reusable-components">
      {defaultGridStyles}
    </style>
  );
}
