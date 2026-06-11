export { ProgressBar }

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      {...__stylex_props(style_7_9._(`${percent.toString()}%`))}
    />
  )
}

// import { apply } from 'vicinage'
//

const style_7_9 = __stylex_create({
  _: (width) => ({
    width,
  }),
})

import { create as __stylex_create } from '@stylexjs/stylex'
import { props as __stylex_props } from '@stylexjs/stylex'
