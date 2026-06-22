const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

test.each([
  { label: 'attr' },
  //
])('$label', async ({ label }) => {
  const transform = useTransformPreserveClass({ applyAs: 'attrs' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'prop' },
  //
])('$label', async ({ label }) => {
  const transform = useTransformPreserveClass({ applyAs: 'props' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { expect } from 'vitest'
import { format } from '#/test/utils/formatter'
import { test } from 'vitest'
import { useTransformPreserveClass } from '#/plugins/preserve-class'
//
