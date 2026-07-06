export { Component }

function Component() {
  return (
    <div {...__styledeck_mergeClass('foo bar', stylexProps(textSize.xl))} />
  )
}

import { props as stylexProps } from '@stylexjs/stylex'
import { textSize } from 'solarwindcss'
//

import { '~mergeClassProperty' as __styledeck_mergeClass } from 'vicinage'
