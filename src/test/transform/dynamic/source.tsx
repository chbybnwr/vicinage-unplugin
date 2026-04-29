export { ProgressBar }

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      {...apply({
        width: () => `${percent.toString()}%`,
      })}
    />
  )
}

import { apply } from 'vicinage'
//
