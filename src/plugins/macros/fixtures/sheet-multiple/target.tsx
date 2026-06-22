export { Feed }

function Feed() {
  return <Post style={[style_6_20._, style_8_9._('green')]} />
}

import { Post } from '#/test/fixtures/post'
// import { sheet } from 'vicinage'
//

const style_8_9 = __stylex_create({
  _: (backgroundColor) => ({
    backgroundColor,
  }),
})

const style_6_20 = __stylex_create({
  _: {
    color: 'blue',
  },
})

import { create as __stylex_create } from '@stylexjs/stylex'
