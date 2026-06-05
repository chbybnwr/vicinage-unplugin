export { Component }

function Component() {
  return (
    <div
      styledeck={[
        textSize.xl,
        {
          color: 'red',
        },
      ]}
    />
  )
}

import { textSize } from 'solarwindcss'
//
