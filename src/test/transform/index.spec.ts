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

  const result = transform(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { transform } from '#/test/setup'
//
