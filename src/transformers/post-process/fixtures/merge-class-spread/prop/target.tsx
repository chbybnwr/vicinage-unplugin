export { Component }

function Component(props: object) {
  return (
    <div
      {...__styledeck_resolveProps(
        {
          ...props,
        },
        {
          className: 'alpha bravo',
        },
      )}
    />
  )
}

import { '~resolveProps' as __styledeck_resolveProps } from 'vicinage'
