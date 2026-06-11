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

  expect(result?.code).toBe(target)
})

test.each([
  { label: 'prop' },
  //
])('$label', async ({ label }) => {
  const transform = useTransformPreserveClass({ applyAs: 'props' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect(result?.code).toBe(target)
})

import { createFixtureLoader } from '#/test/utils'
import { expect } from 'vitest'
import { test } from 'vitest'
import { useTransformPreserveClass } from '#/plugins/preserve-class'
//
