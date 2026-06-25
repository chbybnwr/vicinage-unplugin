export {}

declare module 'vue' {
  interface HTMLAttributes {
    styleDeck?: StyleDeck
    className?: ClassValue | undefined
  }

  interface SVGAttributes {
    styleDeck?: StyleDeck
  }
}

import type { ClassValue } from 'vue'
import type { StyleDeck } from 'vicinage'
//
