export { Parent }

function Parent() {
  return (
    <Component
      styleDeck={__styledeck_sheet({
        color: 'red',
      })}
    />
  )
}

import { Component } from '#/test/fixtures/component'
//

import { sheet as __styledeck_sheet } from 'vicinage'
