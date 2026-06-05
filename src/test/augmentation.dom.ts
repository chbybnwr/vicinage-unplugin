export default {}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    styledeck?: StyleDeck
  }
}

import type { StyleDeck } from 'vicinage'
//
