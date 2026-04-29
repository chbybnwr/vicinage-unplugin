export { SaveButton }

function SaveButton({ isEnabled }: { isEnabled: boolean }) {
  return (
    <button
      {...apply(
        isEnabled && {
          fontWeight: 'bold',
        },
      )}
    >
      Save changes
    </button>
  )
}

import { apply } from 'vicinage'
//
