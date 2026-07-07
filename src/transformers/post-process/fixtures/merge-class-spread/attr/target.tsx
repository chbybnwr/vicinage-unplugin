export { Component }

function Component(props: object) {
  return (
    <div
      {...__styledeck_resolveAttrs(
        {
          'data-literal': 'text',
          'data-expression': null,
          'data-boolean': true,
          ...props,
        },
        {
          class: 'alpha bravo',
        },
      )}
    />
  )
}

import { '~resolveAttrs' as __styledeck_resolveAttrs } from 'vicinage'
