test.each([
  { label: 'merge-class/attr' },
  { label: 'merge-class/attr-logical' },
  { label: 'merge-class/attr-runtime' },
  //
])('$label', async ({ label }) => {
  const transform = usePostProcess({ applyAs: 'attrs' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'merge-class/prop' },
  { label: 'merge-class/prop-logical' },
  { label: 'merge-class/prop-runtime' },
  //
])('$label', async ({ label }) => {
  const transform = usePostProcess({ applyAs: 'props' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'merge-class/skip/no-relevant-props' },
  //
])('$label', async ({ label }) => {
  const id = new URL(`fixtures/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })
  const transform = usePostProcess()
  const result = transform(code, id)

  expect(result).toBeNull()
})

test.each([
  { label: 'hoist-static/single' },
  { label: 'hoist-static/multiple' },
  { label: 'hoist-static/mixed' },
  //
])('$label', async ({ label }) => {
  const transform = usePostProcess()
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transform(source, id)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'hoist-static/skip/logical' },
  { label: 'hoist-static/skip/dynamic' },
  //
])('$label', async ({ label }) => {
  const id = new URL(`fixtures/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })
  const transform = usePostProcess()
  const result = transform(code, id)

  expect(result).toBeNull()
})

test.each([
  { label: 'swap-attrs' },
  //
])('$label', async ({ label }) => {
  const swapAttrs = usePostProcess({ applyAs: 'attrs' })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = swapAttrs(source, id)

  expect(result?.code).toBe(target)
})

const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { expect } from 'vitest'
import { format } from '#/test/utils/formatter'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { usePostProcess } from '.'
//
