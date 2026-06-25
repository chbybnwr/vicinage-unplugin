export { Feed }

function Feed() {
  return <Post styleDeck={[style_6_18._, style_8_9._('green')]} />
}

import { Post } from '#/test/fixtures/post'
//

const style_8_9 = __stylex_create({
  _: (backgroundColor) => ({
    backgroundColor,
  }),
})

const style_6_18 = __stylex_create({
  _: {
    color: 'blue',
  },
})

import { create as __stylex_create } from '@stylexjs/stylex'
