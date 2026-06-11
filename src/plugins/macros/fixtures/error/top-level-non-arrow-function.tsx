export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        // eslint-disable-next-line object-shorthand
        opacity: function () {
          return 0
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
