export { Component }

function Component() {
  return (
    <div
      {...__styledeck_apply({
        color: 'red',
      })}
    />
  )
}

import { apply as __styledeck_apply } from 'vicinage'
