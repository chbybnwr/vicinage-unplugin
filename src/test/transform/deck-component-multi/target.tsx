export { Parent }

function Parent() {
  return (
    <Component
      styledeck={__styledeck_sheet(
        textSize.xl,
        {
          color: 'red',
        },
      )}
    />
  )
}

import { Component } from '#/test/fixtures/component'
import { textSize } from 'solarwindcss'
//

import { sheet as __styledeck_sheet } from 'vicinage'
