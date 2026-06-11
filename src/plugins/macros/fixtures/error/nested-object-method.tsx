export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        color: {
          default() {
            return 'red'
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
