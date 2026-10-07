// Every selector is `element:where(.class)`: specificity (0,0,1). It wins over a
// `*` reset, ties with element resets, and loses to any class the consumer adds.
// Colors use light-dark(), so the grid follows the `color-scheme` it sits in.
export const defaultGridStyles = `
:where(.rc-root) {
  --_background: var(--rc-background, light-dark(#ffffff, #0a0a0a));
  --_foreground: var(--rc-foreground, light-dark(#0a0a0a, #fafafa));
  --_muted: var(--rc-muted, light-dark(#f5f5f5, #262626));
  --_muted-foreground: var(--rc-muted-foreground, light-dark(#737373, #a3a3a3));
  --_border: var(--rc-border, light-dark(#e5e5e5, rgb(255 255 255 / 0.1)));
  --_input: var(--rc-input, light-dark(#e5e5e5, rgb(255 255 255 / 0.15)));
  --_ring: var(--rc-ring, light-dark(#a3a3a3, #737373));
  --_primary: var(--rc-primary, light-dark(#171717, #e5e5e5));
  --_primary-foreground: var(--rc-primary-foreground, light-dark(#fafafa, #171717));
  --_accent: var(--rc-accent, light-dark(#f5f5f5, #262626));
  --_destructive: var(--rc-destructive, light-dark(#dc2626, #f87171));
  --_destructive-foreground: var(--rc-destructive-foreground, #ffffff);
  --_popover: var(--rc-popover, light-dark(#ffffff, #171717));
  --_popover-foreground: var(--rc-popover-foreground, var(--_foreground));
  --_header-foreground: var(--rc-header-foreground, var(--_foreground));
  --_row-hover: var(--rc-row-hover-background, color-mix(in oklab, var(--_muted) 50%, transparent));
  --_row-selected: var(--rc-row-selected-background, var(--_muted));
  --_overlay-background: var(--rc-overlay-background, color-mix(in oklab, var(--_background) 65%, transparent));
  --_spinner-color: var(--rc-spinner-color, var(--_foreground));
  --_shadow: var(--rc-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1));
  --_radius: var(--rc-radius, 8px);
  --_control-height: var(--rc-control-height, 36px);
  --_cell-padding: var(--rc-cell-padding, 8px 12px);
  --_row-height: var(--rc-row-height, 49px);
  --_header-height: 41px;
  --_control-background: light-dark(transparent, rgb(255 255 255 / 0.045));
  --_button-background: light-dark(var(--_background), rgb(255 255 255 / 0.045));
  --_shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --_focus-ring: 0 0 0 3px color-mix(in oklab, var(--_ring) 50%, transparent);
  color: var(--_foreground);
  font-family: var(--rc-font-family, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
  font-size: var(--rc-font-size, 0.875rem);
  line-height: 1.5;
}
:where(.dark, [data-theme="dark"]) :where(.rc-root:not([data-color-scheme])) { color-scheme: dark; }
:where(.light, [data-theme="light"]) :where(.rc-root:not([data-color-scheme])) { color-scheme: light; }
:where(.rc-root[data-color-scheme]) { background: var(--_background); }
:where(.rc-root[data-color-scheme="light"]) { color-scheme: light; }
:where(.rc-root[data-color-scheme="dark"]) { color-scheme: dark; }
:where(.rc-root[data-color-scheme="system"]) { color-scheme: light dark; }
:where(.rc-root[data-color-scheme] .rc-root) { background: none; }

section:where(.rc-page) { display: grid; gap: 24px; min-width: 0; }
header:where(.rc-page__header) { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 24px; }
h1:where(.rc-page__title) { margin: 0; font-size: 1.5rem; font-weight: 600; line-height: 1.25; letter-spacing: -0.025em; }
p:where(.rc-page__description) { margin: 4px 0 0; color: var(--_muted-foreground); }
div:where(.rc-page__actions) { display: flex; flex-wrap: wrap; gap: 8px; }

div:where(.rc-grid) { display: grid; gap: 16px; min-width: 0; }
div:where(.rc-grid__toolbar) { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
div:where(.rc-grid__toolbar:empty) { display: none; }
div:where(.rc-grid__search) { position: relative; flex: 1 1 240px; max-width: 384px; }
div:where(.rc-grid__search) > svg { position: absolute; top: 50%; left: 10px; color: var(--_muted-foreground); pointer-events: none; transform: translateY(-50%); }
div:where(.rc-grid__toolbar-end) { display: flex; flex-wrap: wrap; gap: 8px; margin-inline-start: auto; }

input:where(.rc-control), select:where(.rc-control) {
  box-sizing: border-box;
  height: var(--_control-height);
  min-width: 0;
  margin: 0;
  padding: 0 12px;
  border: 1px solid var(--_input);
  border-radius: var(--_radius);
  background-color: var(--_control-background);
  box-shadow: var(--_shadow-xs);
  color: var(--_foreground);
  font: inherit;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
input:where(.rc-control:focus-visible), select:where(.rc-control:focus-visible) { border-color: var(--_ring); box-shadow: var(--_focus-ring); }
input:where(.rc-control)::placeholder { color: var(--_muted-foreground); opacity: 1; }
input:where(.rc-control[type="number"]) { appearance: textfield; -moz-appearance: textfield; }
input:where(.rc-control[type="number"])::-webkit-inner-spin-button,
input:where(.rc-control[type="number"])::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }
select:where(.rc-control) {
  padding-right: 32px;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--_muted-foreground) 50%),
    linear-gradient(135deg, var(--_muted-foreground) 50%, transparent 50%);
  background-position: calc(100% - 16px) 52%, calc(100% - 11.5px) 52%;
  background-repeat: no-repeat;
  background-size: 5px 5px;
  cursor: pointer;
}
select:where(.rc-control) option { background: var(--_popover); color: var(--_popover-foreground); }
input:where(.rc-grid__search-input) { width: 100%; padding-left: 34px; }
div:where(.rc-grid__filter-popover) input:where(.rc-control), div:where(.rc-grid__filter-popover) select:where(.rc-control) { width: 100%; }
div:where(.rc-range) { display: flex; gap: 8px; min-width: 150px; }
div:where(.rc-range) > input:where(.rc-control) { flex: 1 1 0; width: 0; min-width: 0; }

input:where(.rc-checkbox) {
  display: inline-grid;
  flex-shrink: 0;
  place-content: center;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  margin: 0;
  border: 1px solid var(--_input);
  border-radius: 4px;
  background: var(--_control-background);
  box-shadow: var(--_shadow-xs);
  appearance: none;
  cursor: pointer;
  outline: none;
  vertical-align: middle;
  transition: background-color 150ms, border-color 150ms, box-shadow 150ms;
}
input:where(.rc-checkbox)::before {
  content: "";
  width: 10px;
  height: 10px;
  background: var(--_primary-foreground);
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  transform: scale(0);
  transition: transform 120ms ease-out;
}
input:where(.rc-checkbox:checked), input:where(.rc-checkbox:indeterminate) { border-color: var(--_primary); background: var(--_primary); }
input:where(.rc-checkbox:checked)::before { transform: scale(1); }
input:where(.rc-checkbox:indeterminate)::before { clip-path: inset(40% 10%); transform: scale(1); }
input:where(.rc-checkbox:focus-visible) { border-color: var(--_ring); box-shadow: var(--_focus-ring); }
input:where(.rc-checkbox:disabled) { cursor: not-allowed; opacity: 0.5; }
th:where(.rc-grid__select-cell) > input:where(.rc-checkbox), td:where(.rc-grid__select-cell) > input:where(.rc-checkbox) { display: grid; }
label:where(.rc-toggle) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: var(--_control-height);
  padding: 0 12px;
  border: 1px solid var(--_input);
  border-radius: var(--_radius);
  background: var(--_control-background);
  box-shadow: var(--_shadow-xs);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

button:where(.rc-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  height: var(--_control-height);
  margin: 0;
  padding: 0 16px;
  border: 1px solid var(--_input);
  border-radius: var(--_radius);
  background: var(--_button-background);
  box-shadow: var(--_shadow-xs);
  color: var(--_foreground);
  font: inherit;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms, color 150ms, border-color 150ms, box-shadow 150ms, opacity 150ms;
}
button:where(.rc-button:hover:not(:disabled)) { background: var(--_accent); }
button:where(.rc-button:focus-visible) { border-color: var(--_ring); box-shadow: var(--_focus-ring); }
button:where(.rc-button:disabled) { cursor: not-allowed; opacity: 0.5; }
button:where(.rc-button) > svg { flex-shrink: 0; }
button:where(.rc-button[data-variant="ghost"]) { border-color: transparent; background: transparent; box-shadow: none; }
button:where(.rc-button[data-variant="ghost"]:hover:not(:disabled)) { background: var(--_accent); }
button:where(.rc-button[data-variant="primary"]) { border-color: var(--_primary); background: var(--_primary); color: var(--_primary-foreground); }
button:where(.rc-button[data-variant="primary"]:hover:not(:disabled)) { background: color-mix(in oklab, var(--_primary) 90%, transparent); }
button:where(.rc-button[data-tone="danger"]) { color: var(--_destructive); }
button:where(.rc-button[data-tone="danger"]:hover:not(:disabled)) { background: color-mix(in oklab, var(--_destructive) 10%, transparent); }
button:where(.rc-button[data-tone="danger"][data-variant="primary"]) { border-color: var(--_destructive); background: var(--_destructive); color: var(--_destructive-foreground); }
button:where(.rc-button[data-size="small"]) { gap: 6px; height: 32px; padding: 0 12px; }
button:where(.rc-button[data-icon]) { width: var(--_control-height); padding: 0; }
button:where(.rc-button[data-icon][data-size="small"]) { width: 32px; }

div:where(.rc-grid__bulk) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 12px;
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  background: var(--_row-hover);
}
span:where(.rc-grid__bulk-count) { margin-inline-end: auto; font-weight: 500; }

div:where(.rc-grid__table-frame) {
  --_body-height: calc(var(--_reserved-rows, 0) * var(--_row-height));
  position: relative;
  min-width: 0;
}
div:where(.rc-grid__table-wrapper) {
  box-sizing: border-box;
  min-height: calc(var(--_header-height) + var(--_body-height) + 2px);
  overflow-x: auto;
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
}
div:where(.rc-grid__table-frame[data-fixed-height]) > div:where(.rc-grid__table-wrapper) { height: var(--_table-height); min-height: 0; overflow: auto; }
table:where(.rc-grid__table) { width: 100%; border-collapse: collapse; border-spacing: 0; caption-side: bottom; }
th:where(.rc-grid__header-cell) { height: calc(var(--_header-height) - 1px); padding: 0 12px; border-bottom: 1px solid var(--_border); background: var(--rc-header-background, transparent); color: var(--_header-foreground); font-weight: 500; text-align: start; vertical-align: middle; white-space: nowrap; }
div:where(.rc-grid__table-frame[data-fixed-height]) th:where(.rc-grid__header-cell) { position: sticky; top: 0; z-index: 1; background: var(--rc-header-background, var(--_background)); box-shadow: inset 0 -1px 0 var(--_border); }
td:where(.rc-grid__cell) { box-sizing: border-box; height: calc(var(--_row-height) - 1px); padding: var(--_cell-padding); border-bottom: 1px solid var(--_border); vertical-align: middle; white-space: nowrap; }
tbody > tr:where(.rc-grid__row:last-child) > td { border-bottom: 0; }
tr:where(.rc-grid__row) > td { transition: background-color 150ms; }
tr:where(.rc-grid__row:hover) > td { background: var(--_row-hover); }
tr:where(.rc-grid__row[data-selected]) > td { background: var(--_row-selected); }
th:where([data-align="center"]), td:where([data-align="center"]) { text-align: center; }
th:where([data-align="end"]), td:where([data-align="end"]) { text-align: end; }
th:where(.rc-grid__select-cell), td:where(.rc-grid__select-cell) { width: 1%; padding-inline-end: 0; }
th:where(.rc-grid__actions-cell), td:where(.rc-grid__actions-cell) { width: 1%; padding-block: 4px; text-align: end; white-space: nowrap; }
div:where(.rc-grid__row-actions) { display: inline-flex; gap: 4px; }

span:where(.rc-grid__header) { display: inline-flex; align-items: center; gap: 2px; }
button:where(.rc-grid__sort) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  margin: 0 0 0 -8px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--_radius);
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms;
}
th:where([data-align="end"]) button:where(.rc-grid__sort) { margin: 0; }
button:where(.rc-grid__sort:hover) { background: var(--_accent); }
button:where(.rc-grid__sort:focus-visible) { box-shadow: var(--_focus-ring); }
span:where(.rc-grid__sort-icon) { display: inline-flex; color: var(--_muted-foreground); }
th:where([aria-sort="ascending"], [aria-sort="descending"]) span:where(.rc-grid__sort-icon) { color: var(--_header-foreground); }
button:where(.rc-grid__filter-trigger) {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--_radius);
  background: transparent;
  color: var(--_muted-foreground);
  cursor: pointer;
  outline: none;
  transition: background-color 150ms, color 150ms;
}
button:where(.rc-grid__filter-trigger:hover) { background: var(--_accent); color: var(--_foreground); }
button:where(.rc-grid__filter-trigger:focus-visible) { box-shadow: var(--_focus-ring); }
button:where(.rc-grid__filter-trigger[data-active]) { color: var(--_header-foreground); }
button:where(.rc-grid__filter-trigger[data-active]) > svg { fill: currentColor; }

div:where(.rc-grid__filter-popover) {
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  width: 256px;
  max-width: calc(100vw - 16px);
  margin: 0;
  padding: 12px;
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  background: var(--_popover);
  box-shadow: var(--_shadow);
  color: var(--_popover-foreground);
  font-weight: 400;
  text-align: start;
  white-space: normal;
}
div:where(.rc-grid__filter-popover:popover-open) { display: grid; gap: 10px; animation: rc-pop-in 120ms ease-out; }
div:where(.rc-grid__filter-popover) > button:where(.rc-button) { justify-self: end; }
span:where(.rc-grid__filter-title) { font-weight: 500; line-height: 1; }

div:where(.rc-menu) {
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  min-width: 10rem;
  margin: 0;
  padding: 4px;
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  background: var(--_popover);
  box-shadow: var(--_shadow);
  color: var(--_popover-foreground);
  font-weight: 400;
  text-align: start;
  white-space: nowrap;
}
div:where(.rc-menu:popover-open) { display: grid; animation: rc-pop-in 120ms ease-out; }
button:where(.rc-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  border: 0;
  border-radius: calc(var(--_radius) - 2px);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: default;
  outline: none;
}
button:where(.rc-menu__item:hover:not(:disabled)), button:where(.rc-menu__item:focus-visible) { background: var(--_accent); }
button:where(.rc-menu__item) > svg { flex-shrink: 0; color: var(--_muted-foreground); }
button:where(.rc-menu__item[data-tone="danger"]) { color: var(--_destructive); }
button:where(.rc-menu__item[data-tone="danger"]) > svg { color: inherit; }
button:where(.rc-menu__item[data-tone="danger"]:hover:not(:disabled)), button:where(.rc-menu__item[data-tone="danger"]:focus-visible) { background: color-mix(in oklab, var(--_destructive) 10%, transparent); }
button:where(.rc-menu__item:disabled) { opacity: 0.5; }
div:where(.rc-menu__separator) { height: 1px; margin: 4px -4px; background: var(--_border); }

td:where(.rc-grid__state) { height: max(96px, var(--_body-height)); padding: 16px; color: var(--_muted-foreground); text-align: center; }
div:where(.rc-grid__table-frame[data-fixed-height]) td:where(.rc-grid__state) { height: calc(var(--_table-height) - var(--_header-height) - 2px); }
td:where(.rc-grid__state[data-tone="danger"]) { color: var(--_destructive); }
span:where(.rc-grid__empty-value) { color: var(--_muted-foreground); }

div:where(.rc-grid__overlay) {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  border-radius: var(--_radius);
  background: var(--_overlay-background);
  animation: rc-fade-in 150ms ease-out;
}
span:where(.rc-spinner) {
  display: inline-block;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border: 2.5px solid color-mix(in oklab, var(--_spinner-color, currentColor) 18%, transparent);
  border-top-color: var(--_spinner-color, currentColor);
  border-radius: 50%;
  animation: rc-spin 700ms linear infinite;
}

nav:where(.rc-grid__pagination) { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; color: var(--_muted-foreground); }
div:where(.rc-grid__pagination-group) { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; color: var(--_foreground); font-weight: 500; }
label:where(.rc-grid__page-size) { display: flex; align-items: center; gap: 8px; }
label:where(.rc-grid__page-size) > select:where(.rc-control) { height: 32px; }
div:where(.rc-grid__page-buttons) { display: flex; gap: 8px; }

.rc-visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

@keyframes rc-pop-in { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes rc-fade-in { from { opacity: 0; } }
@keyframes rc-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  :where(.rc-root) :not(.rc-spinner), :where(.rc-root) *::before { transition: none; animation: none; }
  span:where(.rc-spinner) { animation-duration: 1.6s; }
}
`;
