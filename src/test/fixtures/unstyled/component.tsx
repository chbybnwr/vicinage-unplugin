export { Component }

function Component(props: ComponentProps<'div'>) {
  return <div {...props}>Lorem ipsum</div>
}

import type { ComponentProps } from 'react'
//
