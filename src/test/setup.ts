export { transform }

const {
  transform: { handler: transform },
} = createPlugin(
  // eslint-disable-next-line no-undefined
  undefined,
  {},
) as unknown as {
  transform: {
    handler: (code: string, id: string) => { code: string } | null
  }
}

import { createPlugin } from '#/plugin'
//
