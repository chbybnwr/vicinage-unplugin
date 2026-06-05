export { Component }

function Component({ styledeck }: { styledeck?: StyleDeck }) {
  return (
    <div
      styledeck={[
        {
          color: 'black',
        },
        styledeck,
      ]}
    >
      Lorem ipsum
    </div>
  )
}

import type { StyleDeck } from 'vicinage'
//
