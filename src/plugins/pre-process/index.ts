export { createPlugin as default }
export { usePreProcess }

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

const indentSize = 2
const indentStyle = ' '
const contextualClosureBaseLevel = 3

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:macros`,
  enforce: 'pre',

  transform: {
    filter: {
      id: {
        include: /\.(t|j)sx?$/u,
        exclude: /node_modules/,
      },
      code: {
        include: ['styleDeck', 'StyleDeck'],
      },
    },

    handler: usePreProcess(options),
  },
})

const usePreProcess = (options?: Options) => {
  const applyAs = options?.applyAs ?? 'props'
  const unstyledComponentModules = options?.unstyledComponentModules

  const htmlClass = applyAs === 'props' ? 'className' : 'class'

  return (code: string, _id: string) => {
    const ms = new MagicString(code)
    const hoistedStyles = new Set<string>()
    const stylexImports = new Set<string>()

    function shred(
      node: Node,
      sheetPrefix: string,
      propertyKey: string,
    ): string {
      if (isConditionalExpression(node)) {
        const { test } = node
        const condition = code.slice(test.start!, test.end!)
        const consequent = shred(node.consequent, sheetPrefix, propertyKey)
        const alternate = shred(node.alternate, sheetPrefix, propertyKey)

        return `${condition} ? ${consequent} : ${alternate}`
      }

      if (isLogicalExpression(node) && node.operator === '&&') {
        const { left, right } = node

        const condition = code.slice(left.start!, left.end!)
        const consequent = shred(right, sheetPrefix, propertyKey)

        return `${condition} && ${consequent}`
      }

      const location = node.loc!
      const sheetName = `${sheetPrefix}_x_${location.start.line}_${location.start.column + 1}`
      const contextual = extractContextualClosures(
        node,
        contextualClosureBaseLevel,
        propertyKey,
      )
      const staticObjectValue =
        contextual?.paramList.length === 0 ? contextual.source : null

      hoistedStyles.add(
        [
          `const ${sheetName} = __stylex_create({`,
          `  _: {`,

          `    ${propertyKey}: ${staticObjectValue ?? code.slice(node.start!, node.end!)},`,
          `  },`,
          `})`,
        ].join('\n'),
      )

      return `${sheetName}._`
    }

    function extractFunctionValue(
      node: ArrowFunctionExpression | FunctionExpression,
    ) {
      const { body, loc: location } = node

      if (isBlockStatement(body)) {
        throw new Error(
          `[${pluginName}] Dynamic style function body must be an expression.`,
        )
      }

      const bodySource = code.slice(body.start!, body.end!)

      const paramName = `value_${location!.start.line}_${location!.start.column + 1}`

      return {
        bodySource,
        paramName,
      }
    }

    function extractContextualClosures(
      node: Node,
      level: number,
      sourceLocation: string,
    ): {
      source: string
      valueArgList: string[]
      paramList: string[]
    } | null {
      if (!isObjectExpression(node)) {
        return null
      }

      const chunkList = ['{']
      const valueArgList: string[] = []
      const paramList: string[] = []

      for (const property of node.properties) {
        if (isSpreadElement(property)) {
          throw new Error(
            `[${pluginName}] Spread elements in style objects are not supported at ${sourceLocation}`,
          )
        }

        const { key, computed } = property
        const value = isObjectMethod(property) ? property : property.value

        const rawKeySource = code.slice(key.start!, key.end!)
        const propertyKey = computed ? `[${rawKeySource}]` : rawKeySource
        const nestedSourceLocation = `${sourceLocation}.${propertyKey}`

        if (isObjectMethod(property)) {
          throw new Error(
            `[${pluginName}] Dynamic style function body must be an expression.`,
          )
        }

        if (isFunctionExpression(value)) {
          throw new Error(
            `[${pluginName}] Dynamic style function body must be an expression.`,
          )
        }

        if (isArrowFunctionExpression(value)) {
          const extracted = extractFunctionValue(value)
          paramList.push(extracted.paramName)
          valueArgList.push(extracted.bodySource)
          chunkList.push(
            `${indent(level)}${propertyKey}: ${extracted.paramName},`,
          )

          continue
        }

        const nested = extractContextualClosures(
          value,
          level + 1,
          nestedSourceLocation,
        )

        if (nested != null) {
          paramList.push(...nested.paramList)
          valueArgList.push(...nested.valueArgList)
          chunkList.push(`${indent(level)}${propertyKey}: ${nested.source},`)

          continue
        }

        chunkList.push(
          `${indent(level)}${propertyKey}: ${code.slice(value.start!, value.end!)},`,
        )
      }

      chunkList.push(`${indent(level - 1)}}`)

      return {
        source: chunkList.join('\n'),
        valueArgList,
        paramList,
      }
    }

    function shredWithinPseudo(
      node: Node,
      sheetPrefix: string,
      pseudoElementKey: string,
      propertyKey: string,
    ): string {
      if (isConditionalExpression(node)) {
        const { test } = node

        const condition = code.slice(test.start!, test.end!)
        const consequent = shredWithinPseudo(
          node.consequent,
          sheetPrefix,
          pseudoElementKey,
          propertyKey,
        )
        const alternate = shredWithinPseudo(
          node.alternate,
          sheetPrefix,
          pseudoElementKey,
          propertyKey,
        )

        return `${condition} ? ${consequent} : ${alternate}`
      }

      if (isLogicalExpression(node) && node.operator === '&&') {
        const { left, right } = node

        const condition = code.slice(left.start!, left.end!)
        const consequent = shredWithinPseudo(
          right,
          sheetPrefix,
          pseudoElementKey,
          propertyKey,
        )

        return `${condition} && ${consequent}`
      }

      const location = node.loc!

      const finalSheetName = `${sheetPrefix}_x_${location.start.line}_${location.start.column + 1}`

      hoistedStyles.add(
        [
          `const ${finalSheetName} = __stylex_create({`,
          `  _: {`,
          `    ${pseudoElementKey}: {`,

          `      ${propertyKey}: ${code.slice(node.start!, node.end!)},`,
          `    },`,
          `  },`,
          `})`,
        ].join('\n'),
      )

      return `${finalSheetName}._`
    }

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

    const {
      localNames: unstyledComponentLocalNames,
      namespaceNames: unstyledComponentNamespaceNames,
    } = collectUnstyledComponentImportInfo(ast, unstyledComponentModules)

    traverse(ast, {
      JSXOpeningElement: (path) => {
        const element = path.node

        const isCustomComponent =
          (isJSXIdentifier(element.name) &&
            /^[A-Z]/u.test(element.name.name)) ||
          isJSXMemberExpression(element.name)
        const unstyledRootIdentifier =
          isJSXMemberExpression(element.name) &&
          getJSXMemberExpressionRootIdentifier(element.name)
        const isUnstyledComponent =
          (isJSXIdentifier(element.name) &&
            unstyledComponentLocalNames.has(element.name.name)) ||
          (isNode(unstyledRootIdentifier) &&
            unstyledComponentNamespaceNames.has(unstyledRootIdentifier.name))

        for (const attribute of element.attributes) {
          if (
            !(
              isJSXAttribute(attribute) &&
              isJSXIdentifier(attribute.name) &&
              (attribute.name.name === 'styleDeck' ||
                attribute.name.name.endsWith('StyleDeck'))
            )
          ) {
            continue
          }

          if (!isJSXExpressionContainer(attribute.value)) {
            throw new Error('Invalid styleDeck value')
          }

          const argList = isArrayExpression(attribute.value.expression)
            ? attribute.value.expression.elements
            : [attribute.value.expression]

          const finalArgs = []

          for (const arg of argList) {
            if (arg == null) {
              continue
            }

            if (!isObjectExpression(arg)) {
              validateArg(arg)

              finalArgs.push(code.slice(arg.start!, arg.end!))

              continue
            }

            const staticProps = []
            const extraArgs = []
            const propertyList: (ObjectProperty | ObjectMethod)[] = []

            for (const property of arg.properties) {
              if (isSpreadElement(property)) {
                throw new Error(
                  `[${pluginName}] Spread elements in style objects are not supported`,
                )
              }

              propertyList.push(property)
            }

            for (const property of propertyList) {
              const { key } = property
              const value = isObjectMethod(property) ? property : property.value
              const { computed } = property

              const rawKeySource = code.slice(key.start!, key.end!)
              const propertyKey = computed ? `[${rawKeySource}]` : rawKeySource

              const location = key.loc!

              const sheetName = `style_${location.start.line}_${location.start.column + 1}`

              // Handle pseudo-elements by processing their inner properties
              if (
                isObjectProperty(property) &&
                isObjectExpression(value) &&
                propertyKey.includes('::')
              ) {
                const pseudoValueLocation = value.loc!

                const pseudoValueSheetName = `style_${pseudoValueLocation.start.line}_${pseudoValueLocation.start.column + 1}`
                let hasPseudoConditional = false

                for (const pseudoProp of value.properties) {
                  if (isSpreadElement(pseudoProp)) {
                    throw new Error(
                      `[${pluginName}] Spread elements in style objects are not supported`,
                    )
                  }

                  if (isObjectMethod(pseudoProp)) {
                    throw new Error(
                      `[${pluginName}] Dynamic style function body must be an expression.`,
                    )
                  }

                  const pseudoValue = pseudoProp.value

                  if (
                    isConditionalExpression(pseudoValue) ||
                    (isLogicalExpression(pseudoValue) &&
                      pseudoValue.operator === '&&')
                  ) {
                    hasPseudoConditional = true
                  }
                }

                if (!hasPseudoConditional) {
                  const pseudoContextual = extractContextualClosures(
                    value,
                    contextualClosureBaseLevel,
                    propertyKey,
                  )

                  if (pseudoContextual == null) {
                    staticProps.push(
                      `${indent(indentSize)}${propertyKey}: ${code.slice(value.start!, value.end!)}`,
                    )
                  } else if (pseudoContextual.paramList.length > 0) {
                    hoistedStyles.add(
                      [
                        `const ${sheetName} = __stylex_create({`,
                        `  _: (${pseudoContextual.paramList.join(', ')}) => ({`,
                        `    ${propertyKey}: ${pseudoContextual.source},`,
                        `  }),`,
                        `})`,
                      ].join('\n'),
                    )

                    extraArgs.push(
                      `${sheetName}._(${pseudoContextual.valueArgList.join(', ')})`,
                    )
                  } else {
                    staticProps.push(
                      `${indent(indentSize)}${propertyKey}: ${pseudoContextual.source}`,
                    )
                  }

                  continue
                }

                const pseudoStaticPropertyList: string[] = []

                for (const pseudoProp of value.properties) {
                  if (isSpreadElement(pseudoProp)) {
                    throw new Error(
                      `[${pluginName}] Spread elements in style objects are not supported`,
                    )
                  }

                  if (isObjectMethod(pseudoProp)) {
                    throw new Error(
                      `[${pluginName}] Dynamic style function body must be an expression.`,
                    )
                  }

                  const pseudoValue = pseudoProp.value
                  const { computed: pseudoComputed, key: pseudoKey } =
                    pseudoProp

                  const pseudoRawKey = code.slice(
                    pseudoKey.start!,
                    pseudoKey.end!,
                  )
                  const pseudoPropertyKey = pseudoComputed
                    ? `[${pseudoRawKey}]`
                    : pseudoRawKey

                  const pseudoLocation = pseudoKey.loc!

                  const pseudoSheetName = `style_${pseudoLocation.start.line}_${pseudoLocation.start.column + 1}`

                  if (
                    isConditionalExpression(pseudoValue) ||
                    (isLogicalExpression(pseudoValue) &&
                      pseudoValue.operator === '&&')
                  ) {
                    extraArgs.push(
                      shredWithinPseudo(
                        pseudoValue,
                        pseudoSheetName,
                        propertyKey,
                        pseudoPropertyKey,
                      ),
                    )
                  } else if (isArrowFunctionExpression(pseudoValue)) {
                    const { bodySource, paramName: coordinateParam } =
                      extractFunctionValue(pseudoValue)

                    const isSimpleIdentifier =
                      isIdentifier(pseudoKey) && !pseudoComputed
                    const paramName = isSimpleIdentifier
                      ? pseudoRawKey
                      : coordinateParam

                    const objectBody = isSimpleIdentifier
                      ? paramName
                      : `${pseudoPropertyKey}: ${paramName}`

                    hoistedStyles.add(
                      [
                        `const ${pseudoSheetName} = __stylex_create({`,
                        `  _: (${paramName}) => ({`,
                        `    ${propertyKey}: {`,
                        `      ${objectBody},`,
                        `    },`,
                        `  }),`,
                        `})`,
                      ].join('\n'),
                    )
                    extraArgs.push(`${pseudoSheetName}._(${bodySource})`)
                  } else {
                    if (isFunctionExpression(pseudoValue)) {
                      throw new Error(
                        `[${pluginName}] Dynamic style function body must be an expression.`,
                      )
                    }

                    const pseudoContextual = extractContextualClosures(
                      pseudoValue,
                      contextualClosureBaseLevel + 1,
                      pseudoPropertyKey,
                    )

                    if (pseudoContextual?.paramList.length === 0) {
                      pseudoStaticPropertyList.push(
                        `      ${pseudoPropertyKey}: ${pseudoContextual.source},`,
                      )
                      extraArgs.push(`${pseudoValueSheetName}._`)
                    } else if (pseudoContextual == null) {
                      pseudoStaticPropertyList.push(
                        `      ${pseudoPropertyKey}: ${code.slice(pseudoValue.start!, pseudoValue.end!)},`,
                      )
                      extraArgs.push(`${pseudoValueSheetName}._`)
                    } else {
                      hoistedStyles.add(
                        [
                          `const ${pseudoSheetName} = __stylex_create({`,
                          `  _: (${pseudoContextual.paramList.join(', ')}) => ({`,
                          `    ${propertyKey}: {`,
                          `      ${pseudoPropertyKey}: ${pseudoContextual.source},`,
                          `    },`,
                          `  }),`,
                          `})`,
                        ].join('\n'),
                      )
                      extraArgs.push(
                        `${pseudoSheetName}._(${pseudoContextual.valueArgList.join(', ')})`,
                      )
                    }
                  }
                }

                if (pseudoStaticPropertyList.length > 0) {
                  hoistedStyles.add(
                    [
                      `const ${pseudoValueSheetName} = __stylex_create({`,
                      `  _: {`,
                      `    ${propertyKey}: {`,
                      ...pseudoStaticPropertyList,
                      `    },`,
                      `  },`,
                      `})`,
                    ].join('\n'),
                  )
                }

                continue
              }

              if (
                (isObjectProperty(property) &&
                  isConditionalExpression(value)) ||
                (isObjectProperty(property) &&
                  isLogicalExpression(value) &&
                  value.operator === '&&')
              ) {
                extraArgs.push(shred(value, sheetName, propertyKey))

                continue
              }

              if (isObjectMethod(property)) {
                throw new Error(
                  `[${pluginName}] Dynamic style function body must be an expression.`,
                )
              }

              if (isFunctionExpression(value)) {
                throw new Error(
                  `[${pluginName}] Dynamic style function body must be an expression.`,
                )
              }

              if (isArrowFunctionExpression(value)) {
                const { bodySource, paramName: coordinateParam } =
                  extractFunctionValue(value)

                const isSimpleIdentifier = isIdentifier(key) && !computed
                const paramName = isSimpleIdentifier
                  ? rawKeySource
                  : coordinateParam

                const objectBody = isSimpleIdentifier
                  ? paramName
                  : `${propertyKey}: ${paramName}`

                hoistedStyles.add(
                  [
                    `const ${sheetName} = __stylex_create({`,
                    `  _: (${paramName}) => ({`,
                    `    ${objectBody},`,
                    `  }),`,
                    `})`,
                  ].join('\n'),
                )
                extraArgs.push(`${sheetName}._(${bodySource})`)

                continue
              }

              const contextual = extractContextualClosures(
                value,
                contextualClosureBaseLevel,
                propertyKey,
              )

              if (contextual != null) {
                if (contextual.paramList.length > 0) {
                  hoistedStyles.add(
                    [
                      `const ${sheetName} = __stylex_create({`,
                      `  _: (${contextual.paramList.join(', ')}) => ({`,
                      `    ${propertyKey}: ${contextual.source},`,
                      `  }),`,
                      `})`,
                    ].join('\n'),
                  )

                  extraArgs.push(
                    `${sheetName}._(${contextual.valueArgList.join(', ')})`,
                  )
                } else {
                  staticProps.push(
                    `${indent(indentSize)}${propertyKey}: ${contextual.source}`,
                  )
                }

                continue
              }

              staticProps.push(
                `${indent(indentSize)}${propertyKey}: ${code.slice(value.start!, value.end!)}`,
              )
            }

            if (staticProps.length > 0) {
              const location = arg.loc!

              const baseVariableName = `style_${location.start.line}_${location.start.column + 1}`

              hoistedStyles.add(
                [
                  `const ${baseVariableName} = __stylex_create({`,
                  `  _: {`,
                  staticProps.join(',\n'),
                  `  },`,
                  `})`,
                ].join('\n'),
              )

              finalArgs.push(`${baseVariableName}._`)
            }

            finalArgs.push(...extraArgs)
          }

          const joined = finalArgs.join(', ')

          if (isCustomComponent && !isUnstyledComponent) {
            ms.overwrite(
              attribute.value.expression.start!,
              attribute.value.expression.end!,
              finalArgs.length === 1 ? joined : `[${joined}]`,
            )
          } else {
            let styleDeckAttrReplacement = `{...__stylex_${applyAs}(${joined})}`

            const classAttr = element.attributes.find(
              (attribute): attribute is JSXAttribute =>
                isJSXAttribute(attribute) &&
                isJSXIdentifier(attribute.name) &&
                attribute.name.name === htmlClass,
            )

            if (classAttr != null) {
              styleDeckAttrReplacement = `data-styledeck ${styleDeckAttrReplacement}`

              const firstAttribute = element.attributes[0]!
              ms.appendLeft(firstAttribute.start!, 'data-styledeck-element ')

              ms.overwrite(
                classAttr.name.start!,
                classAttr.name.end!,
                'data-styledeck-class',
              )
            }

            ms.overwrite(
              attribute.start!,
              attribute.end!,
              styleDeckAttrReplacement,
            )

            stylexImports.add(
              `import { ${applyAs} as __stylex_${applyAs} } from '@stylexjs/stylex'`,
            )

            break
          }
        }
      },
    })

    if (hoistedStyles.size > 0) {
      stylexImports.add(
        `import { create as __stylex_create } from '@stylexjs/stylex'`,
      )
    }

    const footer = [
      ...hoistedStyles,
      ...(stylexImports.size > 0
        ? [[...stylexImports].toSorted().join('\n')]
        : []),
    ]

    if (footer.length > 0) {
      ms.append(`\n${footer.join('\n\n')}\n`)
    }

    if (ms.hasChanged()) {
      return {
        code: ms.toString(),
      }
    }

    return null
  }
}

function indent(level: number) {
  return indentStyle.repeat(level * indentSize)
}

function validateArg(node: Node) {
  if (isObjectExpression(node)) {
    throw new Error(
      `[${pluginName}] Conditional arguments can not be object literals.`,
    )
  }

  if (isConditionalExpression(node)) {
    validateArg(node.consequent)
    validateArg(node.alternate)

    return
  }

  if (isLogicalExpression(node) && node.operator === '&&') {
    const { right } = node

    validateArg(right)
  }
}

function collectUnstyledComponentImportInfo(
  ast: ReturnType<typeof parse>,
  unstyledComponentModules?: string[],
) {
  const localNames = new Set<string>()
  const namespaceNames = new Set<string>()

  if (unstyledComponentModules == null) {
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
  const { object } = expression

  if (isJSXIdentifier(object)) {
    return object
  }

  if (isJSXMemberExpression(object)) {
    return getJSXMemberExpressionRootIdentifier(object)
  }

  return null
}

import type { ArrowFunctionExpression } from '@babel/types'
import createGlobMatcher from 'picomatch'
import type { FunctionExpression } from '@babel/types'
import { isArrayExpression } from '@babel/types'
import { isArrowFunctionExpression } from '@babel/types'
import { isBlockStatement } from '@babel/types'
import { isConditionalExpression } from '@babel/types'
import { isFunctionExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
import { isImportDeclaration } from '@babel/types'
import { isImportNamespaceSpecifier } from '@babel/types'
import { isJSXAttribute } from '@babel/types'
import { isJSXExpressionContainer } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isJSXMemberExpression } from '@babel/types'
import { isLogicalExpression } from '@babel/types'
import { isNode } from '@babel/types'
import { isObjectExpression } from '@babel/types'
import { isObjectMethod } from '@babel/types'
import { isObjectProperty } from '@babel/types'
import { isSpreadElement } from '@babel/types'
import type { JSXAttribute } from '@babel/types'
import type { JSXIdentifier } from '@babel/types'
import type { JSXMemberExpression } from '@babel/types'
import MagicString from 'magic-string'
import type { Node } from '@babel/types'
import type { ObjectMethod } from '@babel/types'
import type { ObjectProperty } from '@babel/types'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
