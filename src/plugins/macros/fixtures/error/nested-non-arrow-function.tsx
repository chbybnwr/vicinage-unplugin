export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        opacity: {
          default: function () {
            return 0
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
