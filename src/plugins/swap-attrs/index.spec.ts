const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

test('swap attrs', async () => {
  const swapAttrs = useSwapAttrs()
  const { id, source, target } = await fixtureLoader.load('.')
  const result = swapAttrs(source, id)

  expect(result?.code).toBe(target)
})

import { createFixtureLoader } from '#/test/utils'
import { expect } from 'vitest'
import { test } from 'vitest'
import { useSwapAttrs } from '#/plugins/swap-attrs'
//
