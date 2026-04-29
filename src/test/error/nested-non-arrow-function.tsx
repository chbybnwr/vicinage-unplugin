export { ProgressBar }

function ProgressBar() {
  return (
    <div
      {...apply({
        opacity: {
          // eslint-disable-next-line object-shorthand
          default: function () {
            /* empty */
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
