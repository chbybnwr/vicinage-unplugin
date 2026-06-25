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

const mergeClassFunctionName = '__styledeck_mergeClass'

function usePostProcess(options?: Options) {
  const applyAs = options?.applyAs ?? 'props'
  const importedMergeClassFunctionName =
    applyAs === 'props' ? `'~mergeClassProperty'` : `'~mergeClassAttribute'`
  const htmlClass = applyAs === 'props' ? 'className' : 'class'

  return (code: string, _id: string) => {
    const editor = new MagicString(code)
    let hasRuntimeRewrites!: boolean

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

    traverse(ast, {
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
            (attributeIdentifier.name === 'styleDeck' ||
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
            `${htmlClass}='${[
              reservedClassAttribute.value.value,
              (compiledAttribute.value! as StringLiteral).value,
            ].join(' ')}'`,
          )
        } else {
          editor.overwrite(
            markerAttribute.start!,
            compiledAttribute.end!,
            `{...${mergeClassFunctionName}(${[
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
    })

    if (applyAs === 'attrs') {
      editor.replaceAll(
        `import { attrs as __stylex_attrs } from '@stylexjs/stylex'`,
        `import { '~attrs' as __stylex_attrs } from 'vicinage'`,
      )
    }

    if (hasRuntimeRewrites) {
      editor.append(
        `\nimport { ${importedMergeClassFunctionName} as ${mergeClassFunctionName} } from '${pluginName}'\n`,
      )
    }

    if (!editor.hasChanged()) {
      return null
    }

    return {
      code: editor.toString(),
    }
  }
}

import { isArrayExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
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
//
