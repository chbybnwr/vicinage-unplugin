export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        width: {
          default: () => {
            /* empty */
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
