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

  const ms = new MagicString(code)
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  traverse(ast, {
    JSXAttribute: (path) => {
      const { node } = path

      if (
        !(
          isCustomComponent(path.parentPath.node) &&
          isJSXIdentifier(node.name) &&
          node.name.name.toLowerCase().endsWith('styledeck') &&
          isJSXExpressionContainer(node.value) &&
          isArrayExpression(node.value.expression) &&
          node.value.expression.elements.every((element) => {
            return (
              isExpression(element) &&
              !isLogicalExpression(element) &&
              !isCallExpression(element)
            )
          })
        )
      ) {
        return
      }

      const { expression } = node.value

      const hoistedStyleDeck = [
        `styleDeck`,
        expression.loc!.start.line,
        expression.loc!.start.column + 1,
      ].join('_')

      ms.overwrite(expression.start!, expression.end!, hoistedStyleDeck)

      ms.append(
        [
          '\n',
          `const ${hoistedStyleDeck} = ${code.slice(expression.start!, expression.end!)}`,
          '\n',
        ].join(''),
      )
    },
  })

  if (!ms.hasChanged()) {
    return null
  }

  const transformedCode = ms.toString()

  return {
    code: transformedCode,
  }
}

function isCustomComponent(node: Node) {
  return (
    isJSXOpeningElement(node) &&
    ((isJSXIdentifier(node.name) && /^[A-Z]/u.test(node.name.name)) ||
      isJSXMemberExpression(node.name))
  )
}

import { isArrayExpression } from '@babel/types'
import { isCallExpression } from '@babel/types'
import { isExpression } from '@babel/types'
import { isJSXExpressionContainer } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isJSXMemberExpression } from '@babel/types'
import { isJSXOpeningElement } from '@babel/types'
import { isLogicalExpression } from '@babel/types'
import MagicString from 'magic-string'
import type { Node } from '@babel/types'
import type { Options } from '#/options.js'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
