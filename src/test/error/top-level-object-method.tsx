export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        color() {
          return 'red'
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
