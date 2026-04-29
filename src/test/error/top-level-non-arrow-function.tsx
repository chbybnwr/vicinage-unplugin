export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        // eslint-disable-next-line object-shorthand
        opacity: function () {
          /* empty */
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
