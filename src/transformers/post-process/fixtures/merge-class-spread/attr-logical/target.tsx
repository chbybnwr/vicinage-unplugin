export { Component }

function Component(props: object) {
  return (
    <div
      {...__styledeck_resolveAttrs(
        {
          ...props,
        },
        { 0: {}, 1: {} }[Math.random() > 0.8 ? 0 : 1],
      )}
    />
  )
}

import { '~resolveAttrs' as __styledeck_resolveAttrs } from 'vicinage'
