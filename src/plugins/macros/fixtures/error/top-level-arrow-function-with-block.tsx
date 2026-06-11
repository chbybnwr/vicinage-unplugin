export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        // eslint-disable-next-line arrow-body-style
        width: () => {
          return 0
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
