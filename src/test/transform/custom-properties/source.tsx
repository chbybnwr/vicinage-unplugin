export { Sidebar }

function Sidebar() {
  return (
    <nav
      {...apply({
        '--sidebar-width': '320px',
      })}
    >
      Navigation
    </nav>
  )
}

import { apply } from 'vicinage'
//
