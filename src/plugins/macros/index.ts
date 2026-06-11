export { createPlugin as default }
export { transform as useTransformMacros }

/* eslint-disable max-lines */
/* eslint-disable no-continue */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */
/* eslint-disable max-params */
/* eslint-disable max-depth */

const apply = 'apply'
const sheet = 'sheet'
const macroSet = new Set([apply, sheet])
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
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: transform(options),
  },
})

const transform = (options?: Options) => (code: string, id: string) => {
  if (
    !(
      !id.includes('node_modules') &&
      code.includes(pluginName) &&
      (code.includes(apply) || code.includes(sheet))
    )
  ) {
    return null
  }

  const applyAs = options?.applyAs ?? 'props'
  const ms = new MagicString(code)
  const hoistedStyles = new Set<string>()
  const stylexImports = new Set<string>()

  function shred(node: Node, sheetPrefix: string, propertyKey: string): string {
    if (isConditionalExpression(node)) {
      const { test } = node
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const condition = code.slice(test.start!, test.end!)
      const consequent = shred(node.consequent, sheetPrefix, propertyKey)
      const alternate = shred(node.alternate, sheetPrefix, propertyKey)

      return `${condition} ? ${consequent} : ${alternate}`
    }

    if (isLogicalExpression(node) && node.operator === '&&') {
      const { left, right } = node
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const condition = code.slice(left.start!, left.end!)
      const consequent = shred(right, sheetPrefix, propertyKey)

      return `${condition} && ${consequent}`
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const location = node.loc!
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    const bodySource = extractFunctionBodySource(body)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-non-null-assertion
    const paramName = `value_${location!.start.line}_${location!.start.column + 1}`

    return {
      bodySource,
      paramName,
    }
  }

  function extractFunctionBodySource(body: Node): string {
    if (!isBlockStatement(body)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return code.slice(body.start!, body.end!)
    }

    throw new Error(
      `[${pluginName}] Dynamic style function body must be an expression.`,
    )
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const condition = code.slice(left.start!, left.end!)
      const consequent = shredWithinPseudo(
        right,
        sheetPrefix,
        pseudoElementKey,
        propertyKey,
      )

      return `${condition} && ${consequent}`
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const location = node.loc!
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const finalSheetName = `${sheetPrefix}_x_${location.start.line}_${location.start.column + 1}`

    hoistedStyles.add(
      [
        `const ${finalSheetName} = __stylex_create({`,
        `  _: {`,
        `    ${pseudoElementKey}: {`,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  traverse(ast, {
    // eslint-disable-next-line complexity
    CallExpression: (path) => {
      const { arguments: argList } = path.node
      const callee = path.node.callee as Identifier
      const macro = getImportedName(path.scope.getBinding(callee.name))

      if (!(macro != null && macroSet.has(macro))) {
        return
      }

      const finalArgs = []

      for (const arg of argList) {
        if (!isObjectExpression(arg)) {
          validateArg(arg)

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const rawKeySource = code.slice(key.start!, key.end!)
          const propertyKey = computed ? `[${rawKeySource}]` : rawKeySource

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const location = key.loc!
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          const sheetName = `style_${location.start.line}_${location.start.column + 1}`

          // Handle pseudo-elements by processing their inner properties
          if (
            isObjectProperty(property) &&
            isObjectExpression(value) &&
            propertyKey.includes('::')
          ) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const pseudoValueLocation = value.loc!
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
              const { computed: pseudoComputed, key: pseudoKey } = pseudoProp
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const pseudoRawKey = code.slice(pseudoKey.start!, pseudoKey.end!)
              const pseudoPropertyKey = pseudoComputed
                ? `[${pseudoRawKey}]`
                : pseudoRawKey
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const pseudoLocation = pseudoKey.loc!
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

                const objBody = isSimpleIdentifier
                  ? paramName
                  : `${pseudoPropertyKey}: ${paramName}`

                hoistedStyles.add(
                  [
                    `const ${pseudoSheetName} = __stylex_create({`,
                    `  _: (${paramName}) => ({`,
                    `    ${propertyKey}: {`,
                    `      ${objBody},`,
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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            (isObjectProperty(property) && isConditionalExpression(value)) ||
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

            const objBody = isSimpleIdentifier
              ? paramName
              : `${propertyKey}: ${paramName}`

            hoistedStyles.add(
              [
                `const ${sheetName} = __stylex_create({`,
                `  _: (${paramName}) => ({`,
                `    ${objBody},`,
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            `${indent(indentSize)}${propertyKey}: ${code.slice(value.start!, value.end!)}`,
          )
        }

        if (staticProps.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const location = arg.loc!
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          const baseVarName = `style_${location.start.line}_${location.start.column + 1}`

          hoistedStyles.add(
            [
              `const ${baseVarName} = __stylex_create({`,
              `  _: {`,
              staticProps.join(',\n'),
              `  },`,
              `})`,
            ].join('\n'),
          )

          finalArgs.push(`${baseVarName}._`)
        }

        finalArgs.push(...extraArgs)
      }

      const joined = finalArgs.join(', ')

      switch (macro) {
        case apply: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ms.overwrite(callee.start!, callee.end!, `__stylex_${applyAs}`)

          if (argList.length > 0) {
            const start = argList[0]?.start
            const end = argList.at(-1)?.end

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ms.overwrite(start!, end!, joined)

            stylexImports.add(
              `import { create as __stylex_create } from '@stylexjs/stylex'`,
            )
          }

          stylexImports.add(
            `import { ${applyAs} as __stylex_${applyAs} } from '@stylexjs/stylex'`,
          )

          break
        }

        case sheet: {
          const { node } = path

          const sheetOutput =
            finalArgs.length === 0
              ? 'undefined'
              : finalArgs.length === 1
                ? joined
                : `[${joined}]`

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ms.overwrite(node.start!, node.end!, sheetOutput)

          if (finalArgs.length > 0) {
            stylexImports.add(
              `import { create as __stylex_create } from '@stylexjs/stylex'`,
            )
          }

          break
        }

        /* v8 ignore next */
        default: {
          break
        }
      }

      path.skip()
    },

    ImportDeclaration: (path) => {
      const { source } = path.node

      if (source.value === pluginName) {
        const { start, end } = path.node
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ms.overwrite(start!, end!, `// ${code.slice(start!, end!)}`)
      }
    },
  })

  if (ms.hasChanged()) {
    const footer = [
      ...hoistedStyles,
      ...(stylexImports.size > 0 ? [[...stylexImports].join('\n')] : []),
    ]

    if (footer.length > 0) {
      ms.append(`\n${footer.join('\n\n')}\n`)
    }

    return {
      code: ms.toString(),
    }
  }

  return null
}

function getImportedName(binding: Binding | undefined): string | null {
  if (!(binding?.kind === 'module')) {
    return null
  }

  const { path } = binding
  const parentNode = path.parentPath?.node as ImportDeclaration

  if (!(parentNode.source.value === pluginName)) {
    return null
  }

  const node = path.node as ImportSpecifier
  const imported = node.imported as Identifier

  return imported.name
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

import type { ArrowFunctionExpression } from '@babel/types'
import type { Binding } from '@babel/traverse'
import type { FunctionExpression } from '@babel/types'
import type { Identifier } from '@babel/types'
import type { ImportDeclaration } from '@babel/types'
import type { ImportSpecifier } from '@babel/types'
import { isArrowFunctionExpression } from '@babel/types'
import { isBlockStatement } from '@babel/types'
import { isConditionalExpression } from '@babel/types'
import { isFunctionExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
import { isLogicalExpression } from '@babel/types'
import { isObjectExpression } from '@babel/types'
import { isObjectMethod } from '@babel/types'
import { isObjectProperty } from '@babel/types'
import { isSpreadElement } from '@babel/types'
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
