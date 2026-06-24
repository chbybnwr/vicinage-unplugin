export { createPlugin as default }
export { usePostProcess }

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:merge`,

  transform: {
    filter: {
      id: {
        include: /\.(t|j)sx?$/u,
        exclude: /node_modules/,
      },
      code: {
        include: ['styleDeck', 'StyleDeck', 'data-styledeck'],
      },
    },

    handler: usePostProcess(options),
  },
})

const mergeClassIdentifier = '__styledeck_mergeClass'

function usePostProcess(options?: Options) {
  return (code: string, _id: string) => {
    const applyAs = options?.applyAs ?? 'props'
    const editor = new MagicString(code)
    let hasRuntimeRewrites!: boolean

    function transform() {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      })

      traverse(ast, {
        JSXOpeningElement: visitor.JSXOpeningElement,

        ...(applyAs === 'attrs'
          ? {
              ImportDeclaration: visitor.ImportDeclaration,
            }
          : {}),
      })

      if (!editor.hasChanged()) {
        return null
      }

      if (hasRuntimeRewrites) {
        const mergeClass =
          applyAs === 'props'
            ? `'~mergeClassProperty'`
            : `'~mergeClassAttribute'`

        editor.append(
          `\nimport { ${mergeClass} as ${mergeClassIdentifier} } from '${pluginName}'\n`,
        )
      }

      return {
        code: editor.toString().replaceAll(/\s+\/>/gu, ' />'),
      }
    }

    const visitor = {
      JSXOpeningElement: (path) => {
        const { node } = path

        let reservedClassAttribute: JSXAttribute | undefined
        let markerAttributeIndex: number | undefined
        const spreadAttributeMap = new Map<number, JSXSpreadAttribute>()

        for (const [index, attribute] of node.attributes.entries()) {
          if (isJSXSpreadAttribute(attribute)) {
            spreadAttributeMap.set(index, attribute)

            continue
          }

          if (!isJSXIdentifier(attribute.name)) {
            continue
          }

          const attributeIdentifier = attribute.name

          switch (attributeIdentifier.name) {
            case 'data-styledeck-class': {
              reservedClassAttribute = attribute

              break
            }

            case 'data-styledeck': {
              markerAttributeIndex = index

              break
            }

            default: {
              break
            }
          }

          if (
            options?.overwriteClass !== true &&
            (attributeIdentifier.name.endsWith('styleDeck') ||
              attributeIdentifier.name.endsWith('StyleDeck')) &&
            isJSXExpressionContainer(attribute.value)
          ) {
            if (!isArrayExpression(attribute.value.expression)) {
              continue
            }

            const arrayExpression = attribute.value.expression

            if (
              !arrayExpression.elements.every(
                (element) =>
                  isIdentifier(element) || isMemberExpression(element),
              )
            ) {
              continue
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

            continue
          }
        }

        if (
          !(
            isStringLiteral(reservedClassAttribute?.value) &&
            markerAttributeIndex != null
          )
        ) {
          return
        }

        const markerAttribute = node.attributes[markerAttributeIndex]!
        const compiledAttribute = node.attributes[markerAttributeIndex + 1]!

        if (isJSXAttribute(compiledAttribute)) {
          editor.overwrite(
            markerAttribute.start!,
            compiledAttribute.end!,
            `${applyAs === 'props' ? 'className' : 'class'}='${[
              reservedClassAttribute.value.value,
              (compiledAttribute.value! as StringLiteral).value,
            ].join(' ')}'`,
          )
        } else {
          editor.overwrite(
            markerAttribute.start!,
            compiledAttribute.end!,
            `{...${mergeClassIdentifier}(${[
              code.slice(
                reservedClassAttribute.value.start!,
                reservedClassAttribute.value.end!,
              ),
              code.slice(
                compiledAttribute.argument.start!,
                compiledAttribute.argument.end!,
              ),
            ].join(', ')})}`,
          )

          hasRuntimeRewrites = true
        }

        editor.remove(
          reservedClassAttribute.start!,
          reservedClassAttribute.end!,
        )
      },

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
          editor.overwrite(
            node.start!,
            node.end!,
            `import { '~attrs' as __stylex_attrs } from 'vicinage'`,
          )
        }
      },
    } satisfies Visitor

    return transform()
  }
}

import { isArrayExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
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
import { pluginName } from '#/shared/config'
import type { StringLiteral } from '@babel/types'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
import type { Visitor } from '@babel/traverse'
//
