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
      const fileURL = new URL(`${label}/${fixtureFileName}`, import.meta.url)

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
  { label: 'deck' },
  { label: 'deck-multi' },
  { label: 'deck-component' },
  { label: 'deck-component-multi' },
  //
])('$label', async ({ label }) => {
  const [source, target] = await Promise.all(
    [...fixtureFileNameSet].map(async (fixtureFileName) => {
      const fileURL = new URL(`${label}/${fixtureFileName}`, import.meta.url)

      return {
        id: fileURL.pathname,
        code: await readFile(fileURL, { encoding: 'utf8' }),
      }
    }),
  )

  expect.assert(source != null)
  expect.assert(target != null)

  const result = transformProps(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

const transformProps = useTransformProps()

test.each([
  { label: 'preserve-class-attr' },
  //
])('$label', async ({ label }) => {
  const [source, target] = await Promise.all(
    [...fixtureFileNameSet].map(async (fixtureFileName) => {
      const fileURL = new URL(`${label}/${fixtureFileName}`, import.meta.url)

      return {
        id: fileURL.pathname,
        code: await readFile(fileURL, { encoding: 'utf8' }),
      }
    }),
  )

  expect.assert(source != null)
  expect.assert(target != null)

  const transform = useTransformPreserveClass({ applyAs: 'attrs' })
  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

test.each([
  { label: 'merge-class-attr' },
  { label: 'merge-class-attr-runtime' },
  //
])('$label', async ({ label }) => {
  const [source, target] = await Promise.all(
    [...fixtureFileNameSet].map(async (fixtureFileName) => {
      const fileURL = new URL(`${label}/${fixtureFileName}`, import.meta.url)

      return {
        id: fileURL.pathname,
        code: await readFile(fileURL, { encoding: 'utf8' }),
      }
    }),
  )

  expect.assert(source != null)
  expect.assert(target != null)

  const transform = useTransformMergeClass({ applyAs: 'attrs' })
  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

test.each([
  { label: 'preserve-class-prop' },
  //
])('$label', async ({ label }) => {
  const [source, target] = await Promise.all(
    [...fixtureFileNameSet].map(async (fixtureFileName) => {
      const fileURL = new URL(`${label}/${fixtureFileName}`, import.meta.url)

      return {
        id: fileURL.pathname,
        code: await readFile(fileURL, { encoding: 'utf8' }),
      }
    }),
  )

  expect.assert(source != null)
  expect.assert(target != null)

  const transform = useTransformPreserveClass({ applyAs: 'props' })
  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

test.each([
  { label: 'merge-class-prop' },
  { label: 'merge-class-prop-runtime' },
  //
])('$label', async ({ label }) => {
  const [source, target] = await Promise.all(
    [...fixtureFileNameSet].map(async (fixtureFileName) => {
      const fileURL = new URL(`${label}/${fixtureFileName}`, import.meta.url)

      return {
        id: fileURL.pathname,
        code: await readFile(fileURL, { encoding: 'utf8' }),
      }
    }),
  )

  expect.assert(source != null)
  expect.assert(target != null)

  const transform = useTransformMergeClass({ applyAs: 'props' })
  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { transformMacros } from '#/test/setup'
import { useTransformMergeClass } from '#/transform-merge-class'
import { useTransformPreserveClass } from '#/transform-preserve-class'
import { useTransformProps } from '#/transform-props'
//
