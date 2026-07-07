export { Component }

function Component(props: object) {
  return (
    <div
      {...__styledeck_resolveAttrs(
        {
          ...props,
        },
        stylexAttrs(textSize.xl),
      )}
    />
  )
}

import { attrs as stylexAttrs } from '@stylexjs/stylex'
import { textSize } from 'solarwindcss'
//

import { '~resolveAttrs' as __styledeck_resolveAttrs } from 'vicinage'
