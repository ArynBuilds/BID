# Security policy

## Supported versions

BID runs on your own computer. Security fixes land on the default branch and in the next release; please run the latest release.

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Use GitHub's private vulnerability reporting ("Security" tab, "Report a vulnerability") on this repository. Include the affected version or commit, the file or screen, reproduction steps and the impact you observed.

We aim to acknowledge reports within 3 working days and to agree on a disclosure date with you once a fix is available. We are happy to credit reporters in the release notes.

---

## Security model

BID is designed for one person on their own computer. Its bots are Claude Code runs that can read and write files and call tools, so the main question is what a bot may do without asking you.

### Actors

| Actor | Authenticates with | Can do |
| --- | --- | --- |
| You | Email and password, created once on the first visit | Everything in the app |
| A bot | Runs in your app, as you | Work in its own folder, use the tools you allowed, ask you for the rest |
| Claude Code | Your Claude Code sign-in, or the API key from Settings | Call the Claude models |
| The MCP bridge | A random bearer token, new for each turn | Call the app's own tools, under their access rules |

### The account

- The first visit creates the account. `addOwner` refuses once any user exists, so nobody can create a second account.
- Passwords are hashed by Tent.js (`passwords.hash`). Sign-in is limited to 5 tries in 10 minutes per email and address, and account creation to 10 tries an hour.
- The session is a cookie that scripts cannot read.

### The network

- The app listens on `127.0.0.1:4805` only. **Do not expose it on a network or the internet.** Anyone who reaches it can try to sign in, and a signed-in session controls bots that run commands on your computer.
- The MCP bridge of a turn listens on `127.0.0.1` at a free port, checks a 24-byte random bearer token on every request, and closes when the turn ends.

### What a bot may do without asking

Each turn runs `claude -p` in the bot's folder, `data/bots/<id>/`, with `--permission-mode acceptEdits` and an explicit list of allowed tools:

| Allowed without asking | Needs your Yes |
| --- | --- |
| Editing files in its own folder | Any tool not in the allowed list, such as `sendInvite` |
| App tools that only read: names starting with `read`, `search`, `find`, `get`, `list`, `look`, and queries with no `danger` | Every function that states `danger: 'ask'` |
| The tools of the MCP apps you switched on for that bot | `Bash` and `PowerShell`, unless Execution is set to "Always allow" |

A tool that Claude Code refuses becomes an ask, and the run waits until you answer. On No, the bot is told not to do it, nor anything in its place. **Settings › Computer › Execution** set to "Never allow" removes `Bash` and `PowerShell` from the bots altogether.

What this does **not** protect against:

- **MCP apps are trusted.** The tools of an app you switched on for a bot run without asking, and a command-based app runs with your own rights. Switch on only servers you trust, and only for the bots that need them.
- **"Always allow" means always.** With Execution set to "Always allow", a bot can run any command as you.
- **Prompt injection.** A bot that reads mail, web pages or files can meet text written to steer it. The asks before acting are the defence; read each ask before you answer Yes.

### Secrets

| Secret | Protects | Where it is kept |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Your Anthropic API account | `data/secrets.live`, encrypted, from Settings or `tent secrets set` |
| `MAIL_KEY`, `CALENDAR_KEY` | Your own mail and calendar MCP servers | `data/secrets.live`, encrypted, from `tent secrets set` |
| `data/secret.key` | Every secret above | Created once by `npm run setup`, readable by your user only |

- The API key is never sent to the browser. Settings shows only its last four characters, which are kept beside your preferences. A query cannot open a secret.
- The driver hands the key to Claude Code as `ANTHROPIC_API_KEY` in the environment of each turn, and to nothing else.
- `data/` is in `.gitignore`. Never commit it, and keep `data/secret.key` private: with it, anyone can open the secrets.

### Limits

- A day's token limit for all bots (**Usage & Billing**) refuses runs once it is reached.
- Each model has a daily limit per caller, and each agent has limits per run: steps, tokens, time, and how long an ask may wait.
- One run takes at most 12 turns.
