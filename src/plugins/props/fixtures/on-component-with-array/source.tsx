export { Parent }

function Parent() {
  return (
    <Component
      styleDeck={[
        textSize.xl,
        {
          color: 'red',
        },
      ]}
    />
  )
}

import { Component } from '#/test/fixtures/component'
import { textSize } from 'solarwindcss'
//
