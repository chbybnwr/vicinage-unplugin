test.each([
  { label: 'extract/on-element' },
  { label: 'extract/on-element-with-array' },
  { label: 'extract/conditional' },
  { label: 'extract/contextual' },
  { label: 'extract/custom-properties' },
  { label: 'extract/dynamic' },
  { label: 'extract/dynamic-deep' },
  { label: 'extract/on-component' },
  { label: 'extract/on-component-with-array' },
  { label: 'extract/on-component-with-parts' },
  { label: 'extract/stylex-vars' },
  { label: 'extract/pseudo-element' },
])('$label', async ({ label }) => {
  const transform = createPreProcessFn()
  const { source, target } = await fixtureLoader.load(label)
  const result = transform(source)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'extract/skip/no-keyword' },
  //
])('$label', async ({ label }) => {
  const transform = createPreProcessFn()
  const id = new URL(`fixtures/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })
  const result = transform(code)

  expect(result).toBeNull()
})

test.each([
  { label: 'extract/on-unstyled-component' },
  { label: 'extract/on-unstyled-component-namespaced' },
  //
])('$label', async ({ label }) => {
  const transform = createPreProcessFn({
    unstyledComponentModules: ['#/test/fixtures/unstyled'],
  })
  const { source, target } = await fixtureLoader.load(label)
  const result = transform(source)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'extract/on-unstyled-component-from-module-glob' },
  //
])('$label', async ({ label }) => {
  const transform = createPreProcessFn({
    unstyledComponentModules: ['#/test/fixtures/unstyled/*'],
  })
  const { source, target } = await fixtureLoader.load(label)
  const result = transform(source)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'error/top-level-spread-element' },
  { label: 'error/nested-spread-element' },
])('$label', async ({ label }) => {
  const transform = createPreProcessFn()
  const id = new URL(`fixtures/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => transform(code)).toThrow(
    /Spread elements in style objects are not supported/u,
  )
})

test.each([
  { label: 'error/top-level-arrow-function-with-block' },
  { label: 'error/nested-arrow-function-with-block' },
  { label: 'error/top-level-non-arrow-function' },
  { label: 'error/nested-non-arrow-function' },
  { label: 'error/top-level-object-method' },
  { label: 'error/nested-object-method' },
])('$label', async ({ label }) => {
  const transform = createPreProcessFn()
  const id = new URL(`fixtures/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => transform(code)).toThrow(
    /Dynamic style function body must be an expression/u,
  )
})

test.each([
  { label: 'error/conditional-object-literal-argument' },
  { label: 'error/short-circuit-object-literal-argument' },
])('$label', async ({ label }) => {
  const transform = createPreProcessFn()
  const id = new URL(`fixtures/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => transform(code)).toThrow(
    /Conditional arguments can not be object literals/u,
  )
})

test.each([
  { label: 'reserve-class/attr' },
  //
])('$label', async ({ label }) => {
  const transform = createPreProcessFn({ applyAs: 'attrs' })
  const { source, target } = await fixtureLoader.load(label)
  const result = transform(source)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

test.each([
  { label: 'reserve-class/prop' },
  //
])('$label', async ({ label }) => {
  const transform = createPreProcessFn({ applyAs: 'props' })
  const { source, target } = await fixtureLoader.load(label)
  const result = transform(source)

  expect.assert(result != null)
  expect(await format(result.code)).toBe(target)
})

const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { createPreProcessFn } from '#/transformers/pre-process'
import { expect } from 'vitest'
import { format } from '#/test/utils/formatter'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
//
