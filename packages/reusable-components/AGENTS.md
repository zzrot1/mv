# AGENTS.md: reusable-components

A React 19 component library: a data grid and a set of form inputs, on a
headless, framework-free core. It is published to npm and used by the Next.js
app at the repository root.

This file is the source of truth for every coding agent working in this
package (Claude Code reads it through `CLAUDE.md`). The rules apply to people too.

## Commands

Run them from `packages/reusable-components/`, or from the repository root with
`--workspace reusable-components`.

| Command | When |
|---|---|
| `npm run test:unit` | after every edit: the unit tests (fast) |
| `npm run test:stories` | after touching a component or a story: every story's `play` and the axe check |
| `npm test` | both of the above |
| `npm run test:coverage` | before finishing: both, and fails under 80% coverage |
| `npm run typecheck` | before finishing |
| `npx eslint packages/reusable-components/src` | before finishing (from the repository root) |
| `npm run storybook` | to see a change: http://localhost:6006 |

The first run on a machine needs the test browser: `npx playwright install chromium`.

## Definition of done

A change to `src/` is finished only when everything below holds, small changes
included. Report each check with its real output; a failing check means the
work is not done.

### Adding a component

1. **Code.** The component goes in `src/<area>/ui/components/<name>.tsx`, its
   React hooks in `src/<area>/ui/`, and pure rules (parsing, math, validation)
   in `src/<area>/domain/`.
2. **Public API.** Export the component, `<Name>Props` and `<Name>Slot` from
   `src/<area>/index.ts`. `src/index.ts` re-exports every area.
3. **Unit tests.** Add `src/<area>/tests/<name>.test.tsx`, named like the
   component's stories file. Pure rules go in `tests/domain.test.ts` (and
   `tests/application.test.ts` for the data grid). The file covers at least:
   - role and accessible name; native props and `ref` reach the native element;
   - controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) use,
     plus the native `onChange`;
   - every prop that changes behaviour (bounds, disabled, read-only, …);
   - keyboard interaction;
   - inside a `Field`: id, description and error wiring;
   - the styling contract: `className`, `classNames` and `styles` per slot,
     `unstyled`, and the `data-*` state attributes;
   - texts coming from the config provider (`labels`);
   - pure rules in `domain/`: input and output tables, edge cases included;
   - a scenario a story already builds (fixtures, a controlled wrapper, a
     form): render that story with `composeStories` instead of rebuilding it.
4. **Stories.** Add `src/<area>/stories/<name>.stories.tsx`:
   - one story per meaningful state (default, sizes, variants, invalid,
     disabled, controlled, a real use case), each visibly different;
   - every story has a `play` function that acts and asserts;
   - every story passes axe (`a11y: { test: "error" }`): accessible names, and
     a contrast of at least 4.5:1 in light and dark;
   - add the component to `src/inputs/stories/theming.stories.tsx` (or the
     area's theming story), so the dark theme and the tokens cover it.
5. **Docs.** Add the component to `README.md`: the components table, its props,
   its slots and its labels.
6. **Checks.** `typecheck`, eslint and `npm run test:coverage` are all green.

### Changing behaviour, a prop or a type

- Change the tests with the code. At least one assertion must fail without the change.
- Bug fix: first a test that reproduces the bug, then the fix.
- New or changed public prop: tests, a story, `README.md`, and a JSDoc line
  when the name doesn't say everything.
- Renaming or removing a public prop, type or slot is a breaking change. Ask first.

### Styling-only change

- A story shows the new state. If it changes something a consumer relies on
  (sizes, tokens, a slot class), its `play` asserts the computed style.
- Check both color schemes; the axe contrast check runs on every story.

### Never

- Skip, `.only`, delete or weaken a test to get to green.
- Lower the coverage thresholds or turn off the a11y test.
- Use `@ts-ignore`, `any`, or `eslint-disable` to silence a real problem.

## Architecture

```
src/
  <area>/
    domain/          pure TypeScript, no React
    application/     state, pipelines and ports (data grid only so far)
    ui/              React hooks, config provider, labels, theme, styles
    ui/components/   one component per file
    stories/         Storybook stories; not published
    tests/           unit tests: one file per component, plus domain (and application)
    index.ts         the area's public API
  shared/            helpers shared by areas: cx, slots, theme, icons, base.css,
                     useControllableState, popover placement
  index.ts           re-exports every area
```

Dependencies point inward only: `domain` imports nothing outside itself,
`application` imports `domain`, and `ui` imports both. A component depends on
shared hooks, never on another component's internals; composing a public
component (`NumberInput` renders `TextInput`) is fine.

## Component conventions

- **Client components.** `"use client"` at the top of every component and hook file.
- **Props.** `<Name>Props` = native element props (minus conflicting names) +
  `InputAppearance<<Name>Slot>` + the component's own props. Every native prop
  and the `ref` reach the native element (React 19: `ref` is a prop; no
  `forwardRef`).
- **Values.** `value` / `defaultValue` / `onValueChange` (`checked` /
  `onCheckedChange` for on/off controls), built on `useControllableState`.
  The native `onChange` still fires.
- **Styling.**
  - CSS lives in one plain `.css` file per area (`styles.css`), imported by the
    component that renders the area's root; shared tokens are in
    `src/shared/base.css`. No CSS Modules: the `rc-*` class names are part of the
    contract.
  - Every selector is `element:where(.rc-block__part)`, so a consumer's single
    class wins.
  - Colors come only from `--rc-*` tokens with `light-dark()`.
  - Every element is reachable through a slot.
  - `unstyled` drops every built-in class.
  - State is exposed as `data-*` attributes.
- **Texts.** No visible or announced string is written into a component. It goes
  in the area's labels object with a default, so apps can translate it (Lingui).
- **Accessibility.** Native elements first. Every control has a name, works
  from the keyboard and exposes its state (`aria-*`).
- **Dependencies.** No runtime dependencies. React >= 19.2 APIs are fine.
- **Comments.** Only JSDoc (`/** … */`) on the public contract: exported types
  and the props a library user sees, when the name doesn't say everything. No
  other comments.

## Testing notes

- `render` from `vitest-browser-react` is async: `const screen = await render(…)`.
- Import `userEvent` and `page` from `vitest/browser`. Assert with
  `await expect.element(locator)`; it retries, so no sleeps.
- Query by role and accessible name. `getByText("x")` matches the element's
  whole text, so use a regex for part of it.
- In stories, use `canvas` from the `play` context and `expect`, `userEvent`,
  `waitFor` and `fn` from `storybook/test`.
- A unit test reuses a story with `composeStories` from `@storybook/react-vite`:
  `const { Controlled } = composeStories(stories)`, then
  `await render(<Controlled onChange={spy} />)`. Props override the story's
  args. Use `fn()` from `storybook/test` for those spies: `vi.fn()` has a
  different type. `.storybook/vitest.setup.ts` applies `preview.ts` to them.
- A modifier key held across actions (Shift + click) needs `userEvent.setup()`.
- A synthetic Escape doesn't close a native `popover`; click its trigger again.
- Measure animated elements with `offsetWidth` / `offsetHeight`, not
  `getBoundingClientRect()`: an entry animation scales them.
- In `vitest.config.ts`, each project needs its own `browser` object (the
  factory): Vitest writes the project name onto it.
- The first run after adding a dependency can fail with "Vitest failed to find
  the runner" while Vite re-optimizes dependencies. Run it again.

## Commits

- Message format: `[Reusable-components] - <What changed>`, for example
  `[Reusable-components] - Add Slider input`.
- Never commit `coverage/`, `storybook-static/` or `*.log`.

## Ask first

- Adding a dependency.
- Renaming or removing a public prop, type, slot, CSS token or label.
- Changing `vitest.config.ts` thresholds or the Storybook a11y setting.
- Editing the repository's `eslint.config.mjs`, or the root `AGENTS.md` (it is
  generated by `next dev`).
