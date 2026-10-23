// Makes the data folder of this computer and the key that seals its secrets, once: `tent start` makes no key of its
// own, and Settings needs one to keep an API key. The first `tent secrets set` makes it, so one harmless secret is set.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const data = join(import.meta.dirname, '..', 'data')
if (existsSync(join(data, 'secret.key'))) {
  console.log('The data folder is ready: nothing to do.')
  process.exit(0)
}
const made = spawnSync('npx', ['tent', 'secrets', 'set', 'BOTS_SETUP', '--live', '--data', data], {
  input: 'made\n',
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: process.platform === 'win32',
})
if (made.status !== 0 || !existsSync(join(data, 'secret.key'))) {
  console.error(
    'Could not make the key of the secrets in data/. Run `npx tent secrets set BOTS_SETUP --live --data data`.',
  )
  process.exit(1)
}
console.log('The data folder is ready. Start the app with `npm start`.')
