export { SaveButton }

function SaveButton({ isEnabled }: { isEnabled: boolean }) {
  return (
    <button
      {...apply(
        isEnabled
          ? {
              fontStyle: 'italic',
            }
          : {
              fontStyle: 'normal',
            },
      )}
    >
      Save changes
    </button>
  )
}

import { apply } from 'vicinage'
//
