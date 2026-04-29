export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        color: {
          default() {
            /* empty */
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
