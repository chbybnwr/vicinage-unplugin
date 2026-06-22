export { createPlugin as default }
export { useTransformMergeClass }

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
        include: ['data-styledeck-class'],
      },
    },

    handler: useTransformMergeClass(options),
  },
})

const mergeClassIdentifier = '__styledeck_mergeClass'

const useTransformMergeClass =
  (options?: Options) => (code: string, _id: string) => {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

    const ms = new MagicString(code)
    const applyAs = options?.applyAs ?? 'props'
    const htmlClass = applyAs === 'props' ? 'className' : 'class'

    let hasRuntimeRewrites!: boolean

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

          const jsxIdentifier = attribute.name

          switch (jsxIdentifier.name) {
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
          ms.overwrite(
            markerAttribute.start!,
            compiledAttribute.end!,
            `${htmlClass}='${[
              reservedClassAttribute.value.value,
              (compiledAttribute.value! as StringLiteral).value,
            ].join(' ')}'`,
          )
        } else {
          ms.overwrite(
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

        ms.remove(reservedClassAttribute.start!, reservedClassAttribute.end!)
      },
    })

    if (!ms.hasChanged()) {
      return null
    }

    if (hasRuntimeRewrites) {
      const mergeClass =
        applyAs === 'props' ? `'~mergeClassProperty'` : `'~mergeClassAttribute'`

      ms.append(
        `\nimport { ${mergeClass} as ${mergeClassIdentifier} } from '${pluginName}'\n`,
      )
    }

    return {
      code: ms.toString().replaceAll(/\s+\/>/gu, ' />'),
    }
  }

import { isJSXAttribute } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import { isJSXSpreadAttribute } from '@babel/types'
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
