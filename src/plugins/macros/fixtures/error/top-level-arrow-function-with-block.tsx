export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        width: () => {
          return 0
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
