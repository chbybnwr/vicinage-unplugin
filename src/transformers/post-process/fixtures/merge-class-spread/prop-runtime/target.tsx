export { Component }

function Component(props: object) {
  return (
    <div
      {...__styledeck_resolveProps(
        {
          ...props,
        },
        stylexProps(textSize.xl),
      )}
    />
  )
}

import { props as stylexProps } from '@stylexjs/stylex'
import { textSize } from 'solarwindcss'
//

import { '~resolveProps' as __styledeck_resolveProps } from 'vicinage'
