const fixtureFileNameSet = new Set(['source.tsx', 'target.tsx'])

test.each([
  { label: 'on-element' },
  { label: 'on-element-with-array' },
  { label: 'on-component' },
  { label: 'on-component-with-array' },
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

  const transformProps = useTransformProps()
  const result = transformProps(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

test.each([
  { label: 'on-unstyled-component' },
  { label: 'on-unstyled-component-namespaced' },
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

  const transformProps = useTransformProps({
    unstyledComponentModules: ['#/test/fixtures/unstyled'],
  })
  const result = transformProps(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

test.each([
  { label: 'on-unstyled-component-from-module-glob' },
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

  const transformProps = useTransformProps({
    unstyledComponentModules: ['#/test/fixtures/unstyled/*'],
  })
  const result = transformProps(source.code, source.id)

  expect(result?.code).toBe(target.code)
})

import { expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { test } from 'vitest'
import { useTransformProps } from '.'
//
