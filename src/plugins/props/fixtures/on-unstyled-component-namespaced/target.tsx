export { Parent }

function Parent() {
  return (
    <Unstyled.Component
      {...__styledeck_apply({
        color: 'red',
      })}
    />
  )
}

import * as Unstyled from '#/test/fixtures/unstyled'
//

import { apply as __styledeck_apply } from 'vicinage'
