import { action, anyone, attempts, boolean, change, fail, link, object, passwords, query, sessions, text } from 'tentjs'

// The app runs on one computer for its owner: the first visitor makes the account, and after that nobody else can.
export const hasAccount = query('hasAccount', {
  about: 'Whether the owner of this computer has made their account yet',
  access: anyone('the sign-in screen asks before anyone is signed in'),
  system: 'counts the users, whom nobody may read yet',
  output: boolean(),
  run: ({ db }) => db.system.users.count({}) > 0,
})

// The owner's account, with the chief and the apps that are ready to switch on, as the seed makes them for Sam.
export const addOwner = change('addOwner', {
  about: 'Makes the one account of this computer, with its chief, its settings and its starter apps',
  access: 'nobody',
  system: 'only the first sign-up makes the owner',
  input: { email: text(), name: text(), password: text() },
  output: text(),
  run: ({ input, db }) => {
    if (db.system.users.count({}) > 0) return fail('has-account', 'This computer has an account already: sign in.')
    const owner = db.system.users.add({ email: input.email, name: input.name, password: input.password, roles: [] })
    db.system.preferences.add({ owner: owner.id })
    db.system.bots.add({
      name: 'Chief',
      kind: 'chief',
      model: 'quick',
      shape: 'star',
      colour: 'amber',
      brief: 'Routes what I ask to the bot whose brief fits, and tells me when it needs me.',
      owner: owner.id,
    })
    db.system.apps.add({
      name: 'Files',
      about: 'Reads and writes the files of a folder you name',
      icon: 'files',
      command: 'npx -y @modelcontextprotocol/server-filesystem .',
      owner: owner.id,
    })
    db.system.apps.add({
      name: 'Browser',
      about: 'Opens pages and works in them, through Playwright',
      icon: 'browser',
      command: 'npx -y @playwright/mcp@latest',
      owner: owner.id,
    })
    return owner.id
  },
})

export const createAccount = action('createAccount', {
  about: 'Makes the account of the owner of this computer, kept on this computer alone, and signs them in',
  access: anyone('the first visitor of a new install makes its account'),
  system: 'makes the one user of this computer',
  input: {
    name: text({ min: 1, max: 100 }),
    email: text({ max: 254 }),
    password: text({ min: 8, max: 200, secret: true }),
  },
  run: async ({ input, call }) => {
    attempts.limit('createAccount', { tries: 10, per: '1 hour', address: true })
    const password = await passwords.hash(input.password)
    sessions.start(call(addOwner, { email: input.email.trim().toLowerCase(), name: input.name.trim(), password }))
  },
})

export const signIn = action('signIn', {
  about: 'Signs the person in by their email and password',
  access: anyone('a visitor signs in'),
  system: 'reads the user of an email, whom nobody may read yet',
  input: { email: text({ max: 254 }), password: text({ max: 200, secret: true }) },
  run: async ({ input, db }) => {
    const email = input.email.trim().toLowerCase()
    attempts.limit(`signIn:${email}`, { tries: 5, per: '10 minutes', address: true })
    const user = await db.system.users.where({ email }).first()
    if (!user?.password || !(await passwords.check(input.password, user.password)))
      return fail('wrong-sign-in', 'That email and password do not fit.')
    sessions.start(user.id)
  },
})

export const signOut = action('signOut', {
  about: 'Signs the person out',
  access: 'signedIn',
  run: () => {
    sessions.end()
  },
})

export const me = query('me', {
  about: 'The signed-in person: their name and email, for the mark at the foot of the sidebar',
  access: 'signedIn',
  output: object({ id: link('users'), name: text(), email: text() }, { optional: true }),
  run: ({ db, user }) => {
    const row = user ? db.users.get(user.id) : undefined
    return row ? { id: row.id, name: row.name ?? '', email: row.email } : undefined
  },
})
