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

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
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

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'no-relevant-props' },
  //
])('skip $label', async ({ label }) => {
  const id = new URL(`fixtures/skip/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })
  const transform = useTransformMergeClass()
  const result = transform(code, id)

  expect(result).toBeNull()
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { expect } from 'vitest'
import { format } from '#/test/utils/formatter'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { useTransformMergeClass } from '#/plugins/merge-class'
//
