/* eslint-disable no-continue */
export { createPlugin as default }
export { useTransformMergeClass }

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const pluginName = 'vicinage'
const synthesizedMergeLocalName = '__styledeck_mergeClass'

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:merge`,

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: useTransformMergeClass(options),
  },
})

const useTransformMergeClass =
  (options?: Options) => (code: string, id: string) => {
    if (
      !(!id.includes('node_modules') && code.includes('data-styledeck-class'))
    ) {
      return null
    }

    const ms = new MagicString(code)
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
    const applyAs = options?.applyAs ?? 'props'
    const htmlClass = applyAs === 'props' ? 'className' : 'class'
    const mergeClass =
      applyAs === 'props' ? `'~mergeClassProperty'` : `'~mergeClassAttribute'`
    const stylexHelperName = applyAs === 'props' ? 'props' : 'attrs'
    const stylexHelpers = collectStylexHelperNames(ast, stylexHelperName)

    // eslint-disable-next-line init-declarations
    let hasRuntimeRewrites!: boolean

    traverse(ast, {
      JSXOpeningElement: (path) => {
        const { node } = path

        const originalClassAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            isJSXAttribute(attribute) &&
            isJSXIdentifier(attribute.name) &&
            attribute.name.name === 'data-styledeck-class',
        )

        if (originalClassAttribute == null) {
          return
        }

        const compiledClassAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            isJSXAttribute(attribute) &&
            isJSXIdentifier(attribute.name) &&
            attribute.name.name === htmlClass,
        )

        if (
          isStringLiteral(originalClassAttribute.value) &&
          isStringLiteral(compiledClassAttribute?.value)
        ) {
          ms.overwrite(
            compiledClassAttribute.value.start!,
            compiledClassAttribute.value.end!,
            `"${[
              originalClassAttribute.value.value,
              compiledClassAttribute.value.value,
            ].join(' ')}"`,
          )
        } else if (compiledClassAttribute == null) {
          const spreadAttribute = node.attributes.find(
            (attribute, index): attribute is JSXSpreadAttribute => {
              const previousAttribute = node.attributes[index - 1]

              return (
                isJSXSpreadAttribute(attribute) &&
                ((isCallExpression(attribute.argument) &&
                  isStylexHelperCall(attribute.argument, stylexHelpers)) ||
                  (previousAttribute != null &&
                    isJSXAttribute(previousAttribute) &&
                    isJSXIdentifier(previousAttribute.name) &&
                    previousAttribute.name.name === 'data-styledeck'))
              )
            },
          )

          if (spreadAttribute != null) {
            const dataValueSource = getAttributeValueSource(
              originalClassAttribute,
              code,
            )
            const spreadSource = code.slice(
              spreadAttribute.argument.start!,
              spreadAttribute.argument.end!,
            )

            ms.overwrite(
              spreadAttribute.start!,
              spreadAttribute.end!,
              `{...${synthesizedMergeLocalName}(${dataValueSource}, ${spreadSource})}`,
            )
            hasRuntimeRewrites = true
          }
        } else {
          const dataValueSource = getAttributeValueSource(
            originalClassAttribute,
            code,
          )
          const compiledValueSource = getAttributeValueSource(
            compiledClassAttribute,
            code,
          )

          ms.overwrite(
            compiledClassAttribute.start!,
            compiledClassAttribute.end!,
            `{...${synthesizedMergeLocalName}(${dataValueSource}, ${compiledValueSource})}`,
          )
          hasRuntimeRewrites = true
        }

        const removeStart =
          originalClassAttribute.start! > 0 &&
          // @ts-expect-error FIX: this please
          /\s/u.test(code[originalClassAttribute.start! - 1])
            ? originalClassAttribute.start! - 1
            : originalClassAttribute.start!
        ms.remove(removeStart, originalClassAttribute.end!)

        {
          const markerAttribute = node.attributes.find(
            (attribute): attribute is JSXAttribute =>
              isJSXAttribute(attribute) &&
              isJSXIdentifier(attribute.name) &&
              attribute.name.name === 'data-styledeck',
          )

          if (markerAttribute != null) {
            // eslint-disable-next-line no-shadow
            const removeStart =
              markerAttribute.start! > 0 &&
              // @ts-expect-error FIX: this please
              /\s/u.test(code[markerAttribute.start! - 1])
                ? markerAttribute.start! - 1
                : markerAttribute.start!
            ms.remove(removeStart, markerAttribute.end!)
          }
        }
      },
    })

    if (!ms.hasChanged()) {
      return null
    }

    if (hasRuntimeRewrites) {
      ms.append(
        `\nimport { ${mergeClass} as ${synthesizedMergeLocalName} } from '${pluginName}'\n`,
      )
    }

    return {
      code: ms.toString().replaceAll(/\s+\/>/gu, ' />'),
    }
  }

function getAttributeValueSource(
  attribute: JSXAttribute,
  code: string,
): string {
  if (attribute.value == null) {
    return '""'
  }

  if (isJSXExpressionContainer(attribute.value)) {
    return code.slice(
      attribute.value.expression.start!,
      attribute.value.expression.end!,
    )
  }

  if (isStringLiteral(attribute.value)) {
    return `'${attribute.value.value.replaceAll("'", String.raw`\'`)}'`
  }

  return code.slice(attribute.value.start!, attribute.value.end!)
}

function isStylexHelperCall(
  node: CallExpression,
  helperNames: Set<string>,
): boolean {
  if (isIdentifier(node.callee)) {
    return helperNames.has(node.callee.name)
  }

  if (isMemberExpression(node.callee)) {
    const { object } = node.callee
    const { property } = node.callee

    return (
      isIdentifier(object) &&
      (isIdentifier(property) || isJSXIdentifier(property)) &&
      helperNames.has(`${object.name}.${property.name}`)
    )
  }

  return false
}

function collectStylexHelperNames(
  ast: ReturnType<typeof parse>,
  helperName: string,
): Set<string> {
  const names = new Set<string>()

  for (const statement of ast.program.body) {
    if (
      !(
        isImportDeclaration(statement) &&
        statement.source.value === '@stylexjs/stylex'
      )
    ) {
      continue
    }

    for (const specifier of statement.specifiers) {
      if (isImportSpecifier(specifier) && isIdentifier(specifier.imported)) {
        const importedName = specifier.imported.name
        const localName = specifier.local.name

        if (importedName === helperName) {
          names.add(localName)
        }
      }

      if (isImportNamespaceSpecifier(specifier)) {
        names.add(`${specifier.local.name}.${helperName}`)
      }
    }
  }

  return names
}

import type { CallExpression } from '@babel/types'
import { isCallExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
import { isImportDeclaration } from '@babel/types'
import { isImportNamespaceSpecifier } from '@babel/types'
import { isImportSpecifier } from '@babel/types'
import { isJSXAttribute } from '@babel/types'
import { isJSXExpressionContainer } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isJSXSpreadAttribute } from '@babel/types'
import { isMemberExpression } from '@babel/types'
import { isStringLiteral } from '@babel/types'
import type { JSXAttribute } from '@babel/types'
import type { JSXSpreadAttribute } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
