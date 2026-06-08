export default {}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    styleDeck?: StyleDeck
    class?: string | undefined
    [x: `data-${string}`]: string | undefined
  }
}

import type { StyleDeck } from 'vicinage'
//
