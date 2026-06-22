const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

test.each([
  { label: 'static' },
  //
])('$label', async ({ label }) => {
  const transform = useHoistStatic()
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect(result?.code).toBe(target)
})

test.each([
  { label: 'logical' },
  { label: 'dynamic' },
  //
])('skip $label', async ({ label }) => {
  const id = new URL(`fixtures/skip/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })
  const transform = useHoistStatic()
  const result = transform(code, id)

  expect(result).toBeNull()
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { useHoistStatic } from '.'
//
