const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

test.each([
  { label: 'attr' },
  { label: 'attr-marked' },
  { label: 'attr-runtime' },
  //
])('$label', async ({ label }) => {
  const transform = useTransformMergeClass({ applyAs: 'attrs' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect(result?.code).toBe(target)
})

test.each([
  { label: 'prop' },
  { label: 'prop-marked' },
  { label: 'prop-runtime' },
  //
])('$label', async ({ label }) => {
  const transform = useTransformMergeClass({ applyAs: 'props' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect(result?.code).toBe(target)
})

import { createFixtureLoader } from '#/test/utils'
import { expect } from 'vitest'
import { test } from 'vitest'
import { useTransformMergeClass } from '#/plugins/merge-class'
//
