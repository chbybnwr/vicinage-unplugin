export { App }

function App() {
  return (
    <div
      {...apply({
        color: 'red',
      })}
    />
  )
}

import { apply } from 'vicinage'
//
