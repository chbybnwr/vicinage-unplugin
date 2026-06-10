export { Parent }

function Parent() {
  return (
    <Component
      {...__styledeck_apply({
        color: 'red',
      })}
    />
  )
}

import { Component } from '#/test/fixtures/unstyled'
//

import { apply as __styledeck_apply } from 'vicinage'
