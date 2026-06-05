export { useTransformProps }

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable init-declarations */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const pluginName = 'vicinage'
const apply = 'apply'
const sheet = 'sheet'
const synthesizedApplyLocalName = '__styledeck_apply'
const synthesizedSheetLocalName = '__styledeck_sheet'

const traverse =
  (traversal as { default?: typeof traversal }).default ?? traversal

const useTransformProps = (options?: Options) => (code: string, id: string) => {
  const styledeck = options?.aliases?.styledeck ?? 'styledeck'

  if (id.includes('node_modules') || !code.includes(styledeck)) {
    return null
  }

  const ms = new MagicString(code)
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })
  const hasSynthesizedApplyImport = hasApplyLocalBinding(
    ast,
    synthesizedApplyLocalName,
  )
  const hasSynthesizedSheetImport = hasSheetLocalBinding(
    ast,
    synthesizedSheetLocalName,
  )

  let hasApplyRewrites!: boolean
  let hasSheetRewrites!: boolean

  traverse(ast, {
    JSXAttribute: (path) => {
      const { node } = path

      if (
        !(
          isJSXIdentifier(node.name) &&
          node.name.name.toLowerCase().endsWith(styledeck)
        )
      ) {
        return
      }

      const { value } = node

      if (
        !(
          isJSXExpressionContainer(value) &&
          !isJSXEmptyExpression(value.expression)
        )
      ) {
        throw new Error(
          `[${pluginName}] styledeck value must be a JSX expression.`,
        )
      }

      const openingElement = path.parentPath.node as JSXOpeningElement
      const isCustomComponent =
        (isJSXIdentifier(openingElement.name) &&
          /^[A-Z]/u.test(openingElement.name.name)) ||
        isJSXMemberExpression(openingElement.name)

      if (isCustomComponent) {
        const propName = node.name.name
        const valueSource = extractSheetValueSource(value.expression, code)

        ms.overwrite(
          node.start!,

          node.end!,
          `${propName}={${valueSource}}`,
        )

        hasSheetRewrites = true
      } else {
        const argSource = extractApplyArgSource(value.expression, code)

        ms.overwrite(
          node.start!,
          node.end!,
          `{...${synthesizedApplyLocalName}(${argSource})}`,
        )

        hasApplyRewrites = true
      }
    },
  })

  if (!hasApplyRewrites && !hasSheetRewrites) {
    return null
  }

  if (!hasSynthesizedApplyImport && hasApplyRewrites) {
    ms.append(
      `\nimport { ${apply} as ${synthesizedApplyLocalName} } from '${pluginName}'\n`,
    )
  }

  if (!hasSynthesizedSheetImport && hasSheetRewrites) {
    ms.append(
      `\nimport { ${sheet} as ${synthesizedSheetLocalName} } from '${pluginName}'\n`,
    )
  }

  const transformedCode = ms.toString()

  return {
    code: transformedCode,
  }
}

function extractApplyArgSource(expression: Node, code: string): string {
  if (isArrayExpression(expression)) {
    if (expression.start == null || expression.end == null) {
      throw new Error(`[${pluginName}] styledeck value must be readable.`)
    }

    const fullArraySource = code.slice(expression.start, expression.end)
    const arrayContent = fullArraySource.slice(1, -1)

    return arrayContent
  }

  return createApplyArgPart(expression, code)
}

function createApplyArgPart(node: Node, code: string): string {
  if (node.start == null || node.end == null) {
    throw new Error(`[${pluginName}] styledeck value must be readable.`)
  }

  return code.slice(node.start, node.end)
}

function hasApplyLocalBinding(
  ast: ReturnType<typeof parse>,
  localName: string,
): boolean {
  for (const statement of ast.program.body) {
    if (
      statement.type === 'ImportDeclaration' &&
      statement.source.value === pluginName
    ) {
      for (const specifier of statement.specifiers) {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.local.name === localName &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === apply
        ) {
          return true
        }
      }
    }
  }

  return false
}

function hasSheetLocalBinding(
  ast: ReturnType<typeof parse>,
  localName: string,
): boolean {
  for (const statement of ast.program.body) {
    if (
      statement.type === 'ImportDeclaration' &&
      statement.source.value === pluginName
    ) {
      for (const specifier of statement.specifiers) {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.local.name === localName &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name === sheet
        ) {
          return true
        }
      }
    }
  }

  return false
}

function extractSheetValueSource(expression: Node, code: string): string {
  if (isArrayExpression(expression)) {
    if (expression.start == null || expression.end == null) {
      throw new Error(`[${pluginName}] styledeck value must be readable.`)
    }

    const fullArraySource = code.slice(expression.start, expression.end)
    const arrayContent = fullArraySource.slice(1, -1)

    return `${synthesizedSheetLocalName}(${arrayContent})`
  }

  return createSheetArgPart(expression, code)
}

function createSheetArgPart(node: Node, code: string): string {
  if (node.start == null || node.end == null) {
    throw new Error(`[${pluginName}] styledeck value must be readable.`)
  }

  const source = code.slice(node.start, node.end)

  if (isObjectExpression(node)) {
    return `${synthesizedSheetLocalName}(${source})`
  }

  return source
}

import { isArrayExpression } from '@babel/types'
import { isJSXEmptyExpression } from '@babel/types'
import { isJSXExpressionContainer } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isJSXMemberExpression } from '@babel/types'
import { isObjectExpression } from '@babel/types'
import type { JSXOpeningElement } from '@babel/types'
import MagicString from 'magic-string'
import type { Node } from '@babel/types'
import type { Options } from '#/options.js'
import { parse } from '@babel/parser'
import traversal from '@babel/traverse'
