export { Component }

function Component(className: string) {
  return (
    <div {...__styledeck_mergeClass(className, { className: 'alpha bravo' })} />
  )
}

import { '~mergeClassProperty' as __styledeck_mergeClass } from 'vicinage'
