export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        width: {
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
