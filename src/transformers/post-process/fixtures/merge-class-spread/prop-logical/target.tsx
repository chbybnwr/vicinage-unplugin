export { Component }

function Component(props: object) {
  return (
    <div
      {...__styledeck_resolveProps(
        {
          ...props,
        },
        { 0: {}, 1: {} }[Math.random() > 0.8 ? 0 : 1],
      )}
    />
  )
}

import { '~resolveProps' as __styledeck_resolveProps } from 'vicinage'
