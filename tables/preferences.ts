import { boolean, choice, link, number, table, text } from 'tentjs'

// What the Settings dialog keeps for its person, the day's limit of use among it.
export const preferences = table('preferences', {
  columns: {
    dayLimit: number({ min: 0, whole: true, default: 200000 }),
    colorScheme: choice(['system', 'light', 'dark'], { default: 'system' }),
    spelling: boolean({ default: true }),
    hardware: boolean({ default: true }),
    autoReview: boolean({ default: true }),
    execution: choice(['ask', 'always', 'never'], { default: 'ask' }),
    zone: text({ optional: true, max: 64 }),
    // The last letters of the API key in the secrets, where one is kept: the key itself never leaves them.
    claudeKeyEnds: text({ optional: true, max: 4 }),
    owner: link('users'),
  },
  owner: 'owner',
  unique: [['owner']],
  access: { read: 'owner', add: 'owner', change: 'owner' },
})
