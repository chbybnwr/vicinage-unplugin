export { Post }

function Post({ style }: { style?: StyleXStyles }) {
  return (
    <div
      {...apply(
        {
          color: 'black',
        },
        style,
      )}
    >
      Lorem ipsum
    </div>
  )
}

import { apply } from 'vicinage'
import type { StyleXStyles } from '@stylexjs/stylex'
//
