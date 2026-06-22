/* eslint-disable @typescript-eslint/no-non-null-assertion */
export { createPlugin as default }
export { useHoistStatic }

const styleDeckVariants = ['styleDeck', 'StyleDeck']

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:prop`,

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: useHoistStatic(options),
  },
})

// eslint-disable-next-line unicorn/consistent-function-scoping
const useHoistStatic = (_options?: Options) => (code: string, id: string) => {
  if (
    !(
      !id.includes('node_modules') &&
      styleDeckVariants.some((variant) => code.includes(variant))
    )
  ) {
    return null
  }

  const editor = new MagicString(code)
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  traverse(ast, {
    JSXAttribute: (path) => {
      const jsxAttribute = path.node

      if (!isJSXIdentifier(jsxAttribute.name)) {
        return
      }

      const jsxIdentifier = jsxAttribute.name

      if (!jsxIdentifier.name.toLowerCase().endsWith('styledeck')) {
        return
      }

      if (!isJSXExpressionContainer(jsxAttribute.value)) {
        return
      }

      const jsxExpressionContainer = jsxAttribute.value

      if (!isArrayExpression(jsxExpressionContainer.expression)) {
        return
      }

      const arrayExpression = jsxExpressionContainer.expression

      if (
        !arrayExpression.elements.every(
          (element) => isIdentifier(element) || isMemberExpression(element),
        )
      ) {
        return
      }

      const styleDeckIdentifier = [
        `styleDeck`,
        arrayExpression.loc!.start.line,
        arrayExpression.loc!.start.column + 1,
      ].join('_')

      editor.overwrite(
        arrayExpression.start!,
        arrayExpression.end!,
        styleDeckIdentifier,
      )

      editor.append(
        [
          '\n',
          `const ${styleDeckIdentifier} = ${code.slice(arrayExpression.start!, arrayExpression.end!)}`,
          '\n',
        ].join(''),
      )
    },
  })

  if (!editor.hasChanged()) {
    return null
  }

  return {
    code: editor.toString(),
  } satisfies TransformResult
}

import { isArrayExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
import { isJSXExpressionContainer } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isMemberExpression } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options.js'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import type { TransformResult } from 'unplugin'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
