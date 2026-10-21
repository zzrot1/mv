@AGENTS.md

## Claude Code

- Work through the Definition of done above as a checklist. When you finish,
  list each item with the command you ran and its result; if a check failed,
  say so instead of calling the work done.
- Fast loop: `npm run test:unit` after each edit. Run `npm test` and
  `npm run test:coverage` once, at the end.
- To see a visual change, start Storybook in the background
  (`npm run storybook`) and screenshot the story with the browser tools when
  they are available. Stop it afterwards, or port 6006 stays taken.
- Tests and stories are part of the change, not a follow-up: write them in the
  same turn as the component, without being asked.
- Commit only when asked, using the format from `AGENTS.md`.
