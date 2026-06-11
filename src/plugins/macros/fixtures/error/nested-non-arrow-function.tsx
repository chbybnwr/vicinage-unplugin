export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        opacity: {
          // eslint-disable-next-line object-shorthand
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
