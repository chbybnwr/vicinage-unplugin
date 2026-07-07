export { Component }

function Component(className: string) {
  return (
    <div {...__styledeck_mergeClass(className, stylexProps(textSize.xl))} />
  )
}

import { props as stylexProps } from '@stylexjs/stylex'
import { textSize } from 'solarwindcss'
//

import { '~mergeClassProperty' as __styledeck_mergeClass } from 'vicinage'
