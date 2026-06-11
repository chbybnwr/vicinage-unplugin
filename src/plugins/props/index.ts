export { createPlugin as default }
export { useTransformProps }

/* eslint-disable prefer-destructuring */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable init-declarations */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const apply = 'apply'
const sheet = 'sheet'
const synthesizedApplyLocalName = '__styledeck_apply'
const synthesizedSheetLocalName = '__styledeck_sheet'
const styleDeckVariants = ['styleDeck', 'StyleDeck']

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:prop`,
  enforce: 'pre',

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: useTransformProps(options),
  },
})

const useTransformProps = (options?: Options) => (code: string, id: string) => {
  const unstyledComponentModules = options?.unstyledComponentModules ?? []

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
  const hasSynthesizedApplyImport = hasApplyLocalBinding(
    ast,
    synthesizedApplyLocalName,
  )
  const hasSynthesizedSheetImport = hasSheetLocalBinding(
    ast,
    synthesizedSheetLocalName,
  )
  const {
    localNames: unstyledComponentLocalNames,
    namespaceNames: unstyledComponentNamespaceNames,
  } = collectUnstyledComponentImportInfo(ast, unstyledComponentModules)

  let hasApplyRewrites!: boolean
  let hasSheetRewrites!: boolean

  traverse(ast, {
    JSXAttribute: (path) => {
      const { node } = path

      if (!isJSXIdentifier(node.name)) {
        return
      }

      const jsxIdentifier = node.name

      if (
        !styleDeckVariants.some((variant) =>
          jsxIdentifier.name.endsWith(variant),
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
          `[${pluginName}] styleDeck value must be a JSX expression.`,
        )
      }

      const openingElement = path.parentPath.node as JSXOpeningElement
      const isCustomComponent =
        (isJSXIdentifier(openingElement.name) &&
          /^[A-Z]/u.test(openingElement.name.name)) ||
        isJSXMemberExpression(openingElement.name)
      const unstyledRootIdentifier =
        isJSXMemberExpression(openingElement.name) &&
        getJSXMemberExpressionRootIdentifier(openingElement.name)
      const isUnstyledComponent =
        (isJSXIdentifier(openingElement.name) &&
          unstyledComponentLocalNames.has(openingElement.name.name)) ||
        (isNode(unstyledRootIdentifier) &&
          unstyledComponentNamespaceNames.has(unstyledRootIdentifier.name))

      if (isCustomComponent && !isUnstyledComponent) {
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
      throw new Error(`[${pluginName}] styleDeck value must be readable.`)
    }

    const fullArraySource = code.slice(expression.start, expression.end)
    const arrayContent = fullArraySource.slice(1, -1)

    return arrayContent
  }

  return createApplyArgPart(expression, code)
}

function createApplyArgPart(node: Node, code: string): string {
  if (node.start == null || node.end == null) {
    throw new Error(`[${pluginName}] styleDeck value must be readable.`)
  }

  return code.slice(node.start, node.end)
}

function hasApplyLocalBinding(
  ast: ReturnType<typeof parse>,
  localName: string,
): boolean {
  for (const statement of ast.program.body) {
    if (
      isImportDeclaration(statement) &&
      statement.source.value === pluginName
    ) {
      for (const specifier of statement.specifiers) {
        if (
          isImportSpecifier(specifier) &&
          specifier.local.name === localName &&
          isIdentifier(specifier.imported) &&
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
      isImportDeclaration(statement) &&
      statement.source.value === pluginName
    ) {
      for (const specifier of statement.specifiers) {
        if (
          isImportSpecifier(specifier) &&
          specifier.local.name === localName &&
          isIdentifier(specifier.imported) &&
          specifier.imported.name === sheet
        ) {
          return true
        }
      }
    }
  }

  return false
}

function collectUnstyledComponentImportInfo(
  ast: ReturnType<typeof parse>,
  unstyledComponentModules: string[],
) {
  const localNames = new Set<string>()
  const namespaceNames = new Set<string>()

  if (unstyledComponentModules.length === 0) {
    return { localNames, namespaceNames }
  }

  const matchers = unstyledComponentModules.map((glob) =>
    createGlobMatcher(glob),
  )

  for (const statement of ast.program.body) {
    if (
      isImportDeclaration(statement) &&
      matchers.some((match) => match(statement.source.value))
    ) {
      for (const specifier of statement.specifiers) {
        if (isImportNamespaceSpecifier(specifier)) {
          namespaceNames.add(specifier.local.name)
        } else {
          localNames.add(specifier.local.name)
        }
      }
    }
  }

  return { localNames, namespaceNames }
}

function getJSXMemberExpressionRootIdentifier(
  expression: JSXMemberExpression,
): JSXIdentifier | null {
  let { object } = expression

  while (isJSXMemberExpression(object)) {
    object = object.object
  }

  return isJSXIdentifier(object) ? object : null
}

function extractSheetValueSource(expression: Node, code: string): string {
  if (isArrayExpression(expression)) {
    if (expression.start == null || expression.end == null) {
      throw new Error(`[${pluginName}] styleDeck value must be readable.`)
    }

    const fullArraySource = code.slice(expression.start, expression.end)
    const arrayContent = fullArraySource.slice(1, -1)

    return `${synthesizedSheetLocalName}(${arrayContent})`
  }

  return createSheetArgPart(expression, code)
}

function createSheetArgPart(node: Node, code: string): string {
  if (node.start == null || node.end == null) {
    throw new Error(`[${pluginName}] styleDeck value must be readable.`)
  }

  const source = code.slice(node.start, node.end)

  if (isObjectExpression(node)) {
    return `${synthesizedSheetLocalName}(${source})`
  }

  return source
}

import createGlobMatcher from 'picomatch'
import { isArrayExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
import { isImportDeclaration } from '@babel/types'
import { isImportNamespaceSpecifier } from '@babel/types'
import { isImportSpecifier } from '@babel/types'
import { isJSXEmptyExpression } from '@babel/types'
import { isJSXExpressionContainer } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isJSXMemberExpression } from '@babel/types'
import { isNode } from '@babel/types'
import { isObjectExpression } from '@babel/types'
import type { JSXIdentifier } from '@babel/types'
import type { JSXMemberExpression } from '@babel/types'
import type { JSXOpeningElement } from '@babel/types'
import MagicString from 'magic-string'
import type { Node } from '@babel/types'
import type { Options } from '#/options.js'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
