export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        width: {
          // eslint-disable-next-line arrow-body-style
          default: () => {
            return 0
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
