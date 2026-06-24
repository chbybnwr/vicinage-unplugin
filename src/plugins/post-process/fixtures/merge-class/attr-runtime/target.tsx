// @ts-nocheck

export { Component }

function Component() {
  return (
    <div {...__styledeck_mergeClass('foo bar', stylexAttrs(textSize.xl))} />
  )
}

import { attrs as stylexAttrs } from '@stylexjs/stylex'
import { textSize } from 'solarwindcss'
//

import { '~mergeClassAttribute' as __styledeck_mergeClass } from 'vicinage'
