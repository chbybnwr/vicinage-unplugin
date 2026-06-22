export { Component }

function Component() {
  return (
    <div
      {...__styledeck_apply(textSize.xl, {
        color: 'red',
      })}
    />
  )
}

import { textSize } from 'solarwindcss'
//

import { apply as __styledeck_apply } from 'vicinage'
