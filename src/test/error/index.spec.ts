test.each([
  { label: 'top-level-spread-element' },
  { label: 'nested-spread-element' },
])('error $label', async ({ label }) => {
  const id = new URL(`${label}.tsx`, import.meta.url).pathname
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
  const id = new URL(`${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => {
    transformMacros(code, id)
  }).toThrow(/Dynamic style function body must be an expression/u)
})

test.each([
  { label: 'conditional-object-literal-argument' },
  { label: 'short-circuit-object-literal-argument' },
])('error $label', async ({ label }) => {
  const id = new URL(`${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  expect(() => {
    transformMacros(code, id)
  }).toThrow(/Conditional arguments can not be object literals/u)
})

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { transformMacros } from '#/test/setup'
//
