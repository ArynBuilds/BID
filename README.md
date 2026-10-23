# tent-bots

Always-on bots that work for you, on your own computer.

Each bot has a name, a brief that says what it is for, and a memory of its own. A bot can run on a schedule, and you can talk to it. The **Chief** sends what you ask to the bot whose brief fits, and bots hand work to each other. Before a bot does anything that sends, pays or deletes, it asks you first, and you answer Yes or No. There is a daily limit on how much the bots can use.

Every bot is run by [Claude Code](https://docs.claude.com/en/docs/claude-code). Your data, your account and your bots' folders stay on your computer. The app is built with [Tent.js](https://tentjs.com).

## What you need

- [Node.js](https://nodejs.org) 26
- One of these two ways to reach Claude:
  - a Claude subscription that you sign in to Claude Code with, or
  - an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

Claude Code is installed along with the app, so you do not need to install it yourself.

## Install

```sh
git clone <this repository> tent-bots
cd tent-bots
npm install
npm run setup
```

`npm run setup` creates the `data/` folder and the key that encrypts the secrets kept there. You only need to run it once.

## Connect Claude

Choose one of the two ways:

- **Claude account:** run `npx claude` once in this folder and sign in. The bots then use your Claude Code sign-in.
- **API key:** start the app, open **Settings › General › Claude** and paste your key. It stays on this computer, encrypted in `data/`. Use **Remove** to go back to the Claude Code sign-in.

## Start

```sh
npm start
```

Open http://127.0.0.1:4805. The first time, the app asks you to **create your account**. The account is stored only on this computer. After that, only that account can sign in.

## Keep it running

To start the bots whenever you sign in to your computer, do the following once:

```sh
npx tent build --out build
npx tent service build --data data --port 4805 --install
```

On Windows this adds a task to the Task Scheduler, on macOS a launchd agent, and on Linux a systemd unit.

## The desktop window (optional)

`desktop/` holds a small [Tauri](https://tauri.app) window. If the app is not running, the window starts it, then shows it. To build the window you need [Rust](https://rustup.rs):

```sh
cd desktop
cargo build --release
cd ..
npx tent service build --data data --port 4805 --line > desktop/target/release/start.txt
```

The window is `desktop/target/release/bots` (`bots.exe` on Windows). It reads the start line from the `start.txt` file next to it, or from the `BOTS_START` environment variable.

## Apps and tools (optional)

Bots reach outside tools through MCP servers. In the app, **Connect apps** lists the servers you can switch on for a bot. A new account starts with two:

- **Files:** reads and writes the files in a folder
- **Browser:** opens web pages and works in them, through Playwright

To add any other MCP server, give it a command or an address.

The `mailbox` and `calendar` services in `services/tools.ts` connect your own mail and calendar MCP servers, at `127.0.0.1:7811` and `127.0.0.1:7812`. If you do not run those servers, everything else still works. To use them:

```sh
npx tent secrets set MAIL_KEY --live --data data
npx tent secrets set CALENDAR_KEY --live --data data
npx tent mcp approve mailbox
npx tent mcp approve calendar
```

## Develop

```sh
npm run dev      # the app with the demo account: sam@example.com / a long secret
npm run check    # every finding of Tent.js at once
npm test         # the tests, with a stand-in Claude Code and stand-in tools
```

The tests never call Claude. `fakes/claude.ts` stands in for Claude Code, and `fakes/tools.ts` stands in for the mail and calendar servers. `seed.ts` adds the demo account in development and in tests only. A real install starts empty.

| Folder | Holds |
|---|---|
| `tables/` | The data: bots, routines, memories, asks, turns, apps, skills, settings |
| `functions/` | Queries, changes and actions, including the account and the Claude connection |
| `agents/` | The bot agent and the Chief |
| `driver/` | How a bot run becomes Claude Code turns, each in the bot's own folder |
| `flows/` | Routines on a schedule, and the invitation that asks before it sends |
| `screens/`, `components/` | The interface |
| `desktop/` | The desktop window |

## License

MIT
