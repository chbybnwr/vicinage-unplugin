export { Feed }

function Feed() {
  return (
    <Post
      styleDeck={{
        color: 'blue',
        backgroundColor: () => 'green',
      }}
    />
  )
}

import { Post } from '#/test/fixtures/post'
//
