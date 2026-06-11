const transformMacros = useTransformMacros()
const fixtureFileNameSet = new Set(['source.tsx', 'target.tsx'])

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
  const [source, target] = await Promise.all(
    [...fixtureFileNameSet].map(async (fixtureFileName) => {
      const fileURL = new URL(
        `fixtures/${label}/${fixtureFileName}`,
        import.meta.url,
      )

      return {
        id: fileURL.pathname,
        code: await readFile(fileURL, { encoding: 'utf8' }),
      }
    }),
  )

  expect.assert(source != null)
  expect.assert(target != null)

  const result = transformMacros(source.code, source.id)

  expect(result?.code).toBe(target.code)
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

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { useTransformMacros } from '.'
//
