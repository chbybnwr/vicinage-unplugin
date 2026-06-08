export { useTransformPreserveClass }

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const useTransformPreserveClass =
  (options?: Options) => (code: string, id: string) => {
    if (id.includes('node_modules')) {
      return null
    }

    const styleDeck = options?.aliases?.styleDeck ?? 'styleDeck'
    const styleDeckVariants = new Set([
      styleDeck,
      `${styleDeck.charAt(0).toUpperCase()}${styleDeck.slice(1)}`,
    ])
    const htmlClass =
      (options?.applyAs ?? 'props') === 'props' ? 'className' : 'class'

    const ms = new MagicString(code)
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })

    traverse(ast, {
      JSXOpeningElement: (path) => {
        const { node } = path

        if (
          !node.attributes.some(
            (attribute) =>
              attribute.type === 'JSXAttribute' &&
              isJSXIdentifier(attribute.name) &&
              styleDeckVariants.has(attribute.name.name),
          )
        ) {
          return
        }

        const originalClassAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            attribute.type === 'JSXAttribute' &&
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
      },
    })

    if (!ms.hasChanged()) {
      return null
    }

    return {
      code: ms.toString(),
    }
  }

import { isJSXIdentifier } from '@babel/types'
import type { JSXAttribute } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { traverse } from '#/shared/traverse'
//
