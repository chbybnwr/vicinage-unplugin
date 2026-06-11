export { Feed }

function Feed() {
  return (
    <Post
      style={sheet({
        color: 'blue',
        backgroundColor: () => 'green',
      })}
    />
  )
}

import { Post } from '#/test/fixtures/post'
import { sheet } from 'vicinage'
//
