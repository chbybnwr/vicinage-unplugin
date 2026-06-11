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
      {...apply({
        [color.primary]: 'blue',
        [color.secondary]: () => secondary,
      })}
    >
      {children}
    </div>
  )
}

const color = stylex.defineVars({
  primary: null,
  secondary: null,
})

import { apply } from 'vicinage'
import type { ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
//
