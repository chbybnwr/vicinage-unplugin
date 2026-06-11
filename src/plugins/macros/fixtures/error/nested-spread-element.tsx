export { App }

const nestedHoverStyles = {
  default: 'blue',
}

function App() {
  return (
    <div
      {...apply({
        fontSize: {
          default: '1rem',
          ':hover': {
            ...nestedHoverStyles,
          },
        },
      })}
    />
  )
}

import { apply } from 'vicinage'
//
