export { App }

const baseStyles = {
  color: 'red',
}

function App() {
  return (
    <div
      {...apply({
        ...baseStyles,
        fontSize: '1rem',
      })}
    />
  )
}

import { apply } from 'vicinage'
//
