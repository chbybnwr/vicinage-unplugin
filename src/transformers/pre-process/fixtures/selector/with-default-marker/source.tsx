export { App }

function App() {
  return (
    <div
      styleDeck={{
        color: {
          default: null,
          [selector(ancestor(defaultMarker()), ':hover', ':focus')]: 'red',
        },
      }}
    />
  )
}

import { ancestor } from 'styledeck'
import { defaultMarker } from '@stylexjs/stylex'
import { selector } from 'styledeck'
//
