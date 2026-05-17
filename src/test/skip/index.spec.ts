test.each([
  { label: 'no-keyword' },
  //
])('skip $label', async ({ label }) => {
  const id = new URL(`${label}.tsx`, import.meta.url).pathname
  const code = await readFile(id, { encoding: 'utf8' })

  const result = transform(code, id)

  expect(result).toBeNull()
})

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { transform } from '#/test/setup'
//
