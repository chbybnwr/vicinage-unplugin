export default {}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    styleDeck?: StyleDeck
  }
}

import type { StyleDeck } from 'vicinage'
//
