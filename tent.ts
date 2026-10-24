import { project } from 'tentjs'

// The table of bots holds the name `bots`, so the project is named apart and the person reads `BID` as its title.
export const botsApp = project('botsApp', {
  title: 'BID',
  signInPath: '/sign-in',
  languages: ['en'],
})
