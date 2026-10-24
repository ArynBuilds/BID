# Running BID

How to install, connect, start and keep BID running on your own computer.

- [1. Requirements](#1-requirements)
- [2. Install](#2-install)
- [3. Connect Claude](#3-connect-claude)
- [4. Start](#4-start)
- [5. Keep it running](#5-keep-it-running)
- [6. The desktop window](#6-the-desktop-window)
- [7. Apps and tools](#7-apps-and-tools)
- [8. Settings](#8-settings)
- [9. Backups and upgrades](#9-backups-and-upgrades)
- [10. Troubleshooting](#10-troubleshooting)

---

## 1. Requirements

- [Node.js](https://nodejs.org) 26
- One of these two ways to reach Claude:
  - a Claude subscription that you sign in to Claude Code with, or
  - an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- For the desktop window only: [Rust](https://rustup.rs)

Claude Code is a dependency of the app, so `npm install` installs it along with the app.

## 2. Install

```sh
git clone https://github.com/ArynBuilds/BID.git && cd BID
npm install
npm run setup
```

`npm run setup` creates `data/` and the key that encrypts the secrets kept there, `data/secret.key`. Run it once. `tent start` makes no key of its own, and Settings needs one to keep an API key.

## 3. Connect Claude

Choose one of the two ways. You can change your choice at any time.

| Way | How | Billed to |
|---|---|---|
| Claude Code sign-in | Run `npx claude` once in the app's folder and sign in | Your Claude subscription |
| API key | **Settings › General › Claude**, paste the key, **Save** | Your Anthropic API account |

The API key is stored as the secret `ANTHROPIC_API_KEY`, encrypted in `data/`. Settings shows only its last four characters. **Remove** forgets it, and the bots go back to the Claude Code sign-in.

## 4. Start

```sh
npm start
```

This builds the app into `build/` and starts it on `http://127.0.0.1:4805`, with its data in `data/`.

The first time, the app asks you to create your account: a name, an email and a password of at least 8 characters. The account is stored only on this computer, and nobody can create a second one. You start with the **Chief** and two apps ready to switch on.

The app listens on `127.0.0.1` only. Do not expose it on a network: see [SECURITY.md](../SECURITY.md).

## 5. Keep it running

To start the app whenever you sign in to your computer:

```sh
npx tent build --out build
npx tent service build --data data --port 4805 --install
```

| System | What is installed |
|---|---|
| Windows | A task of the Task Scheduler, at your sign-in, started again a minute after a failure |
| macOS | A launchd agent of your user |
| Linux | A systemd unit |

`npx tent service build --data data --port 4805` with no `--install` prints what would be installed and changes nothing. After an upgrade, run `npx tent build --out build` again and restart the service.

## 6. The desktop window

`desktop/` is a small [Tauri](https://tauri.app) window. When the app does not answer at `http://127.0.0.1:4805`, the window starts it, shows a waiting page, and then opens `/bots`.

```sh
cd desktop
cargo build --release
cd ..
npx tent build --out build
npx tent service build --data data --port 4805 --line > desktop/target/release/start.txt
```

The window is `desktop/target/release/bid` (`bid.exe` on Windows). It reads its start line from `start.txt` next to it, or from `BOTS_START`. `BOTS_AT` changes the address it opens.

## 7. Apps and tools

A bot reaches outside tools through MCP servers. **Connect apps** lists the servers of your account. For each bot you choose which of them it may use. An app has a name and either a command that Claude Code starts, or an address that it reaches over HTTP. A new account starts with two:

| App | Command |
|---|---|
| Files | `npx -y @modelcontextprotocol/server-filesystem .` |
| Browser | `npx -y @playwright/mcp@latest` |

The tools of the apps you switch on for a bot are allowed without asking. An MCP server runs with your own rights on your computer, so add only servers you trust.

**Your own mail and calendar (optional).** `services/tools.ts` defines two more MCP servers, `mailbox` at `http://127.0.0.1:7811/mcp` and `calendar` at `http://127.0.0.1:7812/mcp`, which every bot can reach. Point them at your own servers, then set their keys and approve their tools:

```sh
npx tent secrets set MAIL_KEY --live --data data
npx tent secrets set CALENDAR_KEY --live --data data
npx tent mcp approve mailbox
npx tent mcp approve calendar
```

`mcp.lock.json` keeps the approved tools and their fingerprints. A bot asks you before it sends an invitation, through the flow `sendInvite`.

## 8. Settings

| Setting | Where | What it does |
|---|---|---|
| Claude | General | Claude Code sign-in or an API key |
| Timezone | General › Bot | The zone in which routines are read, such as "every morning at eight" |
| Execution on this computer | Computer | Whether bots may run commands (`Bash`, `PowerShell`): ask every time, always allow, or never allow |
| Day's limit | Usage & Billing | The tokens all bots may write in a day; a run past it is refused until midnight UTC |

## 9. Backups and upgrades

Everything the app keeps is in `data/`: the tables, the runs, the secrets and each bot's folder in `data/bots/<id>/`. To back up, stop the app and copy `data/`. Keep `data/secret.key` private: without it the secrets cannot be opened, and with it anyone can open them.

To upgrade:

```sh
git pull
npm install
npm start
```

## 10. Troubleshooting

| You see | Do |
|---|---|
| "This computer has no key for secrets yet" | Run `npm run setup`, then save the key again |
| A run fails with `claude-code` | Run `npx claude` in the app's folder and check that it is signed in, or save an API key |
| A run is refused with `day-limit` | Raise the limit in **Usage & Billing**, or wait until midnight UTC |
| A bot waits and does nothing | Look in **/asks**: the run waits for your Yes or No |
| The window shows only the waiting page | Check `start.txt` beside the window, or start the app with `npm start` |
