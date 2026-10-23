import assert from 'node:assert/strict'
import test from 'node:test'
import { testApp } from 'tentjs/test'

const samOf = async (app: Awaited<ReturnType<typeof testApp>>) => {
  const sam = (await app.rows('users')).find((one) => one.email === 'sam@example.com')
  assert.ok(sam)
  return sam.id
}

test('a computer with an account offers no second one', async () => {
  const app = await testApp()
  assert.equal(await app.as('nobody').call('hasAccount', {}), true)
  await assert.rejects(
    app.as('nobody').call('createAccount', { name: 'Eve', email: 'eve@example.com', password: 'long enough' }),
    {
      code: 'has-account',
    },
  )
  assert.equal((await app.rows('users')).length, 1)
  await app.close()
})

test('an API key is kept, shown by its last letters alone, and forgotten again', async () => {
  const app = await testApp()
  const sam = await samOf(app)
  assert.deepEqual(await app.as(sam).call('claudeConnection', {}), { way: 'signIn' })
  await assert.rejects(app.as(sam).call('setClaudeKey', { key: 'not-a-key-of-anthropic-at-all' }), {
    code: 'not-a-key',
  })
  await app.as(sam).call('setClaudeKey', { key: 'sk-ant-api03-example-key-abcd' })
  assert.deepEqual(await app.as(sam).call('claudeConnection', {}), { way: 'apiKey', ends: 'abcd' })
  await app.as(sam).call('removeClaudeKey', {})
  assert.deepEqual(await app.as(sam).call('claudeConnection', {}), { way: 'signIn' })
  await app.close()
})
