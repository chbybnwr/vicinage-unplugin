const fixtureFileNameSet = new Set(['source.tsx', 'target.tsx'])

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
  { label: 'merge-class-attr-marked' },
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
  { label: 'merge-class-prop-marked' },
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
import { useTransformMergeClass } from '#/transform-merge-class'
import { useTransformPreserveClass } from '#/transform-preserve-class'
//
