/* eslint-disable @typescript-eslint/no-non-null-assertion */
export { createPlugin as default }
export { useSwapAttrs }

/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:attrs`,

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: useSwapAttrs(options),
  },
})

// eslint-disable-next-line unicorn/consistent-function-scoping
const useSwapAttrs = (_options?: Options) => (code: string, id: string) => {
  if (
    !(
      !id.includes('node_modules') &&
      code.includes(
        `import { attrs as __stylex_attrs } from '@stylexjs/stylex'`,
      )
    )
  ) {
    return null
  }

  const ms = new MagicString(code)
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  traverse(ast, {
    ImportDeclaration: (path) => {
      const { node } = path

      if (
        node.source.value === '@stylexjs/stylex' &&
        node.specifiers.some(
          (specifier) =>
            specifier.local.name === '__stylex_attrs' &&
            isImportSpecifier(specifier) &&
            isIdentifier(specifier.imported) &&
            specifier.imported.name === 'attrs',
        )
      ) {
        ms.overwrite(
          node.start!,
          node.end!,
          `import { '~attrs' as __stylex_attrs } from 'vicinage'`,
        )
      }
    },
  })

  if (!ms.hasChanged()) {
    return null
  }

  return {
    code: ms.toString(),
  }
}

import { isIdentifier } from '@babel/types'
import { isImportSpecifier } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options.js'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
