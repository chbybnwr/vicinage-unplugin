export { Timestamp }

function Timestamp() {
  return (
    <time
      {...apply(
        {
          color: 'black',
        },
        typography.caption,
      )}
    >
      2 minutes ago
    </time>
  )
}

const typography = stylex.create({
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontStyle: 'italic',
  },
})

import { apply } from 'vicinage'
import * as stylex from '@stylexjs/stylex'
//
