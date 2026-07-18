export { getJSXAttributeSchema }
export type { JSXAttributeSchema }

function getJSXAttributeSchema(): JSXAttributeSchema {
  const rootConfigPath = findConfigFile('./', (fileName) =>
    sys.fileExists(fileName),
  )

  if (typeof rootConfigPath !== 'string') {
    console.info(`[styledeck] jsxAttributeSchema is set to dom-properties`)

    return 'dom-properties'
  }

  const rootConfig = getParsedCommandLineOfConfigFile(
    rootConfigPath,
    {},
    // @ts-expect-error let me in pls
    sys,
  )

  const configPathList = [
    rootConfigPath,
    ...(rootConfig?.projectReferences ?? []).map((reference) =>
      resolveProjectReferencePath(reference),
    ),
  ]

  const jsxExtensionList = ['.jsx', '.tsx']

  const jsxAttributeSchemaSet = new Set(
    configPathList.flatMap((configPath) => {
      const config = getParsedCommandLineOfConfigFile(
        configPath,
        {},
        // @ts-expect-error let me in pls
        sys,
      )

      if (config == null) {
        return []
      }

      const { jsxImportSource } = config.options

      if (jsxImportSource == null) {
        return []
      }

      const isIncludingJsxFiles = config.fileNames.some((fileName) =>
        jsxExtensionList.some((extension) => fileName.endsWith(extension)),
      )

      if (!isIncludingJsxFiles) {
        return []
      }

      return [jsxAttributeSchemaByImportSource.get(jsxImportSource)]
    }),
  )

  if (jsxAttributeSchemaSet.size > 1) {
    throw new Error(
      '[styledeck] Unable to determine `jsxAttributeSchema`. Set it manually in config!',
    )
  }

  const jsxAttributeSchema =
    jsxAttributeSchemaSet.values().next().value ?? 'dom-properties'

  console.info(`[styledeck] jsxAttributeSchema is set to ${jsxAttributeSchema}`)

  return jsxAttributeSchema
}

type JSXAttributeSchema = 'dom-properties' | 'html-attributes'

const jsxAttributeSchemaByImportSource = new Map<string, JSXAttributeSchema>([
  ['@builder.io/qwik', 'html-attributes'],
  ['@emotion/react', 'dom-properties'],
  ['@hono/hono/jsx', 'html-attributes'],
  ['@stencil/core', 'html-attributes'],
  ['hono/jsx', 'html-attributes'],
  ['preact', 'html-attributes'],
  ['react', 'dom-properties'],
  ['solid-js', 'html-attributes'],
  ['theme-ui', 'dom-properties'],
  ['vue', 'html-attributes'],
])

import { findConfigFile } from '@typescript/typescript6'
import { getParsedCommandLineOfConfigFile } from '@typescript/typescript6'
import { resolveProjectReferencePath } from '@typescript/typescript6'
import { sys } from '@typescript/typescript6'
//
