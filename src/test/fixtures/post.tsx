export { Post }

function Post({ styleDeck }: { styleDeck?: StyleDeck }) {
  return (
    <div
      styleDeck={[
        {
          color: 'black',
        },
        styleDeck,
      ]}
    >
      Lorem ipsum
    </div>
  )
}

import type { StyleDeck } from 'vicinage'
//
