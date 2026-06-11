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
      {...__stylex_props(style_12_17._, style_14_10._(secondary))}
    >
      {children}
    </div>
  )
}

const color = stylex.defineVars({
  primary: null,
  secondary: null,
})

// import { apply } from 'vicinage'
import type { ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
//

const style_14_10 = __stylex_create({
  _: (value_14_28) => ({
    [color.secondary]: value_14_28,
  }),
})

const style_12_17 = __stylex_create({
  _: {
    [color.primary]: 'blue'
  },
})

import { create as __stylex_create } from '@stylexjs/stylex'
import { props as __stylex_props } from '@stylexjs/stylex'
