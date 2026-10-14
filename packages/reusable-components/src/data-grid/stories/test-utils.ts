const DATA_CELL = "td.rc-grid__cell:not(.rc-grid__select-cell):not(.rc-grid__actions-cell)";

export function bodyRows(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLTableRowElement>("tbody tr.rc-grid__row")];
}

// Text of one data column (selection and actions cells don't count), top to bottom.
export function columnValues(root: HTMLElement, columnIndex: number) {
  return bodyRows(root).map(
    (row) => row.querySelectorAll(DATA_CELL)[columnIndex]?.textContent ?? "",
  );
}

export function find<TElement extends Element = HTMLElement>(root: ParentNode, selector: string) {
  const element = root.querySelector<TElement>(selector);

  if (!element) {
    throw new Error(`Nothing matches ${selector}`);
  }

  return element;
}

// For controls user-event can't drive, like a range slider.
export function setInputValue(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

  setValue?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
