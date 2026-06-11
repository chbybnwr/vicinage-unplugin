const fixtureFileNameSet = new Set(['source.tsx', 'target.tsx'])

test.each([
  { label: 'attr' },
  //
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

  const transform = useTransformPreserveClass({ applyAs: 'attrs' })
  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

test.each([
  { label: 'prop' },
  //
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

  const transform = useTransformPreserveClass({ applyAs: 'props' })
  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { useTransformPreserveClass } from '#/plugins/preserve-class'
//
