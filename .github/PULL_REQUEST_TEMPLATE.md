## What and why

<!-- What does this change, and what problem does it solve? Link issues with "Fixes #123". -->

## How it was tested

<!-- Steps you ran, and screenshots or recordings for interface changes. -->

## Checklist

- [ ] `npm run check`, `npm run lint` and the engine and setup tests pass
- [ ] No test calls Claude; driver changes are tested against `fakes/claude.ts`
- [ ] Anything that sends, pays or deletes states `danger: 'ask'`
- [ ] Functions with full access state `system` with the reason
- [ ] Docs updated (`README.md`, `docs/`) if behaviour, settings or commands changed
