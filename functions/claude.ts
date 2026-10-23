import { action, change, choice, fail, object, query, secrets, text } from 'tentjs'

// How the bots reach Claude: the person's own Claude Code sign-in, or an Anthropic API key that this computer keeps
// encrypted in its data folder and hands Claude Code as ANTHROPIC_API_KEY. The key itself is never read back out: a
// query may not open a secret, so its last letters are kept beside the person's settings for Settings to show.
const KEY = 'ANTHROPIC_API_KEY'

export const claudeConnection = query('claudeConnection', {
  about: 'How the bots reach Claude, with the last letters of the API key where one is kept',
  access: 'signedIn',
  output: object({ way: choice(['signIn', 'apiKey']), ends: text({ optional: true }) }),
  run: ({ db, user }) => {
    const ends = user ? db.preferences.where({ owner: user.id }).first()?.claudeKeyEnds : undefined
    return ends ? { way: 'apiKey', ends } : { way: 'signIn' }
  },
})

export const markClaudeKey = change('markClaudeKey', {
  about: 'Writes the last letters of the API key that is kept, or that none is',
  access: 'nobody',
  system: 'only setting or removing the key itself marks it',
  input: { owner: text(), ends: text({ max: 4, default: '' }) },
  run: ({ input, db }) => {
    const mine = db.system.preferences.where({ owner: input.owner }).first()
    const set = { claudeKeyEnds: input.ends }
    return mine ? db.system.preferences.change(mine.id, set) : db.system.preferences.add({ ...set, owner: input.owner })
  },
})

export const setClaudeKey = action('setClaudeKey', {
  about: 'Keeps an Anthropic API key, which the bots then use in place of the Claude Code sign-in',
  access: 'signedIn',
  system: 'the one person of this computer sets the key its bots use',
  input: { key: text({ min: 20, max: 300, secret: true }) },
  run: async ({ input, user, call }) => {
    const key = input.key.trim()
    if (!key.startsWith('sk-ant-')) return fail('not-a-key', 'An Anthropic API key starts with sk-ant-.')
    if (!user) return fail('signed-out', 'Sign in first.')
    try {
      await secrets.set(KEY, key)
    } catch (error) {
      // `tent start` makes no key of the secrets: `npm run setup` makes it once.
      if (Object(error).code === 'T0019')
        return fail('no-secret-key', 'This computer has no key for secrets yet: run npm run setup, then try again.')
      throw error
    }
    call(markClaudeKey, { owner: user.id, ends: key.slice(-4) })
  },
})

export const removeClaudeKey = action('removeClaudeKey', {
  about: 'Forgets the API key, so the bots use the Claude Code sign-in again',
  access: 'signedIn',
  system: 'the one person of this computer takes away the key its bots use',
  run: async ({ user, call }) => {
    if (!user) return fail('signed-out', 'Sign in first.')
    try {
      await secrets.remove(KEY)
    } catch {
      // No key was kept: there is nothing to forget.
    }
    call(markClaudeKey, { owner: user.id, ends: '' })
  },
})
