export { Feed }

function Feed() {
  return (
    <Post
      style={sheet({
        color: 'blue',
      })}
    />
  )
}

import { Post } from '#/test/fixtures/post'
import { sheet } from 'vicinage'
//
