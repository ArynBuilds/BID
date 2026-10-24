# Contributing to BID

Thank you for helping. BID runs bots that act on people's computers, so we value small, well-explained, tested changes over large rewrites.

## Ways to contribute

- **Report a bug** with the bug report template. Include steps, expected and actual behaviour, the output of the app, and your version.
- **Propose a feature** with the feature request template before writing a large change, so we can agree on the approach.
- **Improve the docs.** If something in `docs/` does not match the code, the code wins; please fix the doc.
- **Security issues** go through private reporting, never public issues. See [SECURITY.md](SECURITY.md).

Good first areas: translations of the interface, more MCP apps for the starter list, more schedules that `lib/schedule.ts` can read, and a machine of its own for a bot.

## Development setup

You need Node.js 26 and npm. For the desktop window you also need Rust.

```sh
git clone <your fork> BID && cd BID
npm install
npm run dev
```

`npm run dev` starts the app with the demo account from `seed.ts`: `sam@example.com`, password `a long secret`. To run a bot for real, sign in to Claude Code with `npx claude` first.

## Checks

Run these before every pull request; CI runs the same:

```sh
npm run check
npm run lint
npx tent test tests/engine.test.ts
npx tent test tests/setup.test.ts
```

`npm test` also runs the browser walk in Chromium, Firefox and WebKit. `WALK_ENGINES=chromium npx tent test tests/walk.test.ts` runs it in one.

No test calls Claude. `fakes/claude.ts` answers in Claude Code's streamed form, and `fakes/tools.ts` stands in for the mail and calendar servers. A change to the driver comes with a test against the stand-in.

## Code conventions

- **Tent.js first.** Read `AGENTS.md`. Every definition is a top-level `export const name = word('name', { ... })`, and `npm run check` must find nothing.
- **Data is written by a `change` and by nothing else.** A query reads through `db` only.
- **Every function states `access`.** One that needs full access states `system` with the reason.
- **A file imports from one of `tentjs`, `tentjs/ui` and `tentjs/cli`, never two.** A helper that both sides use lives in `lib/`.
- **TypeScript strict, no `any`.** Use proper types or `unknown` with narrowing.
- **A comment says why, in one or two lines.** Never what the code does.
- **Anything that sends, pays or deletes asks first.** A new tool of that kind is a flow or function with `danger: 'ask'`, never a free tool.
- **Never build backend without UI or UI without backend.** A feature is done when a person can use it.

## Commits and pull requests

- Branch from the default branch; keep one logical change per pull request.
- Write commit messages in the imperative mood (`Add a weekly schedule to routines`). Reference issues with `Fixes #123`.
- Fill in the pull request template: what changed, why, how you tested it, and screenshots for interface changes.
- Update `README.md` and `docs/` when behaviour, settings or commands change.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
