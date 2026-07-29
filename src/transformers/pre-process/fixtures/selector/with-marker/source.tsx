export { App }

const marker = defineMarker()

function App() {
  return (
    <div
      styleDeck={{
        color: {
          default: null,
          [selector(ancestor(marker), ':hover', ':focus')]: 'red',
        },
      }}
    />
  )
}

import { ancestor } from 'styledeck'
import { defineMarker } from '@stylexjs/stylex'
import { selector } from 'styledeck'
//
