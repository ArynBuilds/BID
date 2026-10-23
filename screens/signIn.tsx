import './app.css'
import { anyone, Form, read, screen, text } from 'tentjs/ui'
import { Face } from '../components/Face'
import { createAccount, hasAccount, signIn } from '../functions/people'

// A new install has no account: the first screen makes the owner's, which lives on this computer alone.
export const signInScreen = screen('signInScreen', {
  path: '/sign-in',
  title: 'Sign in',
  access: anyone('the way in is open to every visitor'),
  state: { back: { type: text({ default: '/bots' }), in: 'address' } },
  data: { made: read(hasAccount) },
  view: ({ state, made }) => (
    <main className="sign-in">
      {made ? (
        <Form call={signIn} then={{ goTo: `/${state.back.replace(/^\/+/, '')}` }} aria-label="Sign in">
          <Face shape="round" colour="white" size={72} />
          <h1>Sign in to bots</h1>
          <label className="field">
            Email
            <input name="email" type="email" autoComplete="username" />
          </label>
          <label className="field">
            Password
            <input name="password" type="password" autoComplete="current-password" />
          </label>
          <button type="submit" className="light">
            Sign in
          </button>
        </Form>
      ) : (
        <Form call={createAccount} then={{ goTo: '/bots' }} aria-label="Create your account">
          <Face shape="round" colour="white" size={72} />
          <h1>Create your account</h1>
          <p className="sign-in-line">Your account stays on this computer. Nothing is sent anywhere.</p>
          <label className="field">
            Name
            <input name="name" autoComplete="name" />
          </label>
          <label className="field">
            Email
            <input name="email" type="email" autoComplete="username" />
          </label>
          <label className="field">
            Password
            <input name="password" type="password" autoComplete="new-password" minLength={8} />
          </label>
          <button type="submit" className="light">
            Create account
          </button>
        </Form>
      )}
    </main>
  ),
})
