const fixtureLoader = createFixtureLoader({
  baseUrl: import.meta.url,
})

test.each([
  { label: 'on-element' },
  { label: 'on-element-with-array' },
  { label: 'on-component' },
  { label: 'on-component-with-array' },
  //
])('$label', async ({ label }) => {
  const transformProps = useTransformProps()
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transformProps(source, id)

  expect(result?.code).toBe(target)
})

test.each([
  { label: 'on-unstyled-component' },
  { label: 'on-unstyled-component-namespaced' },
  //
])('$label', async ({ label }) => {
  const transformProps = useTransformProps({
    unstyledComponentModules: ['#/test/fixtures/unstyled'],
  })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transformProps(source, id)

  expect(result?.code).toBe(target)
})

test.each([
  { label: 'on-unstyled-component-from-module-glob' },
  //
])('$label', async ({ label }) => {
  const transformProps = useTransformProps({
    unstyledComponentModules: ['#/test/fixtures/unstyled/*'],
  })
  const { id, source, target } = await fixtureLoader.load(label)
  const result = transformProps(source, id)

  expect(result?.code).toBe(target)
})

import { createFixtureLoader } from '#/test/utils/fixture-loader'
import { expect } from 'vitest'
import { test } from 'vitest'
import { useTransformProps } from '.'
//
