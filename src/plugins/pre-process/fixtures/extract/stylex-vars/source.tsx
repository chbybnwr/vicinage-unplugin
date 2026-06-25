export { Container }

function Container({
  secondary,
  children,
}: {
  secondary: string
  children: ReactNode
}) {
  return (
    <div
      styleDeck={{
        [color.primary]: 'blue',
        [color.secondary]: () => secondary,
      }}
    >
      {children}
    </div>
  )
}

const color = stylex.defineVars({
  primary: null,
  secondary: null,
})

import type { ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
//
