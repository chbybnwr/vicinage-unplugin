export { createPlugin as default }
export { useTransformPreserveClass }

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: `${pluginName}:class`,
  enforce: 'pre',

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: useTransformPreserveClass(options),
  },
})

const styleDeckVariants = new Set(['styleDeck', 'StyleDeck'])

const useTransformPreserveClass =
  (options?: Options) => (code: string, id: string) => {
    if (id.includes('node_modules')) {
      return null
    }

    const htmlClass =
      (options?.applyAs ?? 'props') === 'props' ? 'className' : 'class'

    if (
      !(
        code.includes(htmlClass) &&
        styleDeckVariants.values().some((variant) => code.includes(variant))
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
      JSXOpeningElement: (path) => {
        const { node } = path

        const styleDeckAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            isJSXAttribute(attribute) &&
            isJSXIdentifier(attribute.name) &&
            styleDeckVariants.has(attribute.name.name),
        )

        if (styleDeckAttribute == null) {
          return
        }

        if (
          !node.attributes.some(
            (attribute) =>
              isJSXAttribute(attribute) &&
              isJSXIdentifier(attribute.name) &&
              styleDeckVariants.has(attribute.name.name),
          )
        ) {
          return
        }

        const originalClassAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            isJSXAttribute(attribute) &&
            isJSXIdentifier(attribute.name) &&
            attribute.name.name === htmlClass,
        )

        if (originalClassAttribute == null) {
          return
        }

        ms.overwrite(
          originalClassAttribute.start!,
          originalClassAttribute.end!,
          `data-styledeck-class${
            originalClassAttribute.value == null
              ? ''
              : `=${code.slice(
                  originalClassAttribute.value.start!,
                  originalClassAttribute.value.end!,
                )}`
          }`,
        )

        ms.appendLeft(styleDeckAttribute.start!, 'data-styledeck ')
      },
    })

    if (!ms.hasChanged()) {
      return null
    }

    return {
      code: ms.toString(),
    }
  }

import { isJSXAttribute } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import type { JSXAttribute } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import { traverse } from '#/shared/traverse'
import type { UnpluginFactory } from 'unplugin'
//
