export { Component }

function Component() {
  return <div {...__styledeck_mergeClass('foo bar', { 0: {} }[0])} />
}

import { '~mergeClassProperty' as __styledeck_mergeClass } from 'vicinage'
