const transformMacros = useTransformMacros()

const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

test.each([
  { label: 'apply' },
  { label: 'apply-no-styles' },
  { label: 'cascading' },
  { label: 'conditional' },
  { label: 'contextual' },
  { label: 'custom-properties' },
  { label: 'dynamic' },
  { label: 'dynamic-deep' },
  { label: 'sheet' },
  { label: 'sheet-empty' },
  { label: 'sheet-multiple' },
  { label: 'stylex-vars' },
  { label: 'pseudo-element' },
  { label: 'side-effect-import' },
  { label: 'other-module' },
])('$label', async ({ label }) => {
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transformMacros(source, id)

  expect(result?.code).toBe(target)
})

test.each([
  { label: 'no-keyword' },
  //
])('skip $label', async ({ label }) => {
  const id = new URL(`fixtures/skip/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  const result = transformMacros(code, id)

  expect(result).toBeNull()
})

test.each([
  { label: 'top-level-spread-element' },
  { label: 'nested-spread-element' },
])('error $label', async ({ label }) => {
  const id = new URL(`fixtures/error/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => {
    transformMacros(code, id)
  }).toThrow(/Spread elements in style objects are not supported/u)
})

test.each([
  { label: 'top-level-arrow-function-with-block' },
  { label: 'nested-arrow-function-with-block' },
  { label: 'top-level-non-arrow-function' },
  { label: 'nested-non-arrow-function' },
  { label: 'top-level-object-method' },
  { label: 'nested-object-method' },
])('error $label', async ({ label }) => {
  const id = new URL(`fixtures/error/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => {
    transformMacros(code, id)
  }).toThrow(/Dynamic style function body must be an expression/u)
})

test.each([
  { label: 'conditional-object-literal-argument' },
  { label: 'short-circuit-object-literal-argument' },
])('error $label', async ({ label }) => {
  const id = new URL(`fixtures/error/${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => {
    transformMacros(code, id)
  }).toThrow(/Conditional arguments can not be object literals/u)
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { useTransformMacros } from '.'
//
