// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export { Component }

function Component() {
  return <div {...__styledeck_mergeClass('foo bar', stylexAttrs(textSize.xl))} />
}

import { attrs as stylexAttrs } from '@stylexjs/stylex'
import { textSize } from 'solarwindcss'
//

import { mergeClassAttr as __styledeck_mergeClass } from 'vicinage'
