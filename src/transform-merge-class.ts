export { useTransformMergeClass }

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const useTransformMergeClass =
  (options?: Options) => (code: string, id: string) => {
    if (id.includes('node_modules')) {
      return null
    }

    const ms = new MagicString(code)
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
    const htmlClass =
      (options?.applyAs ?? 'props') === 'props' ? 'className' : 'class'

    traverse(ast, {
      JSXOpeningElement: (path) => {
        const { node } = path

        const originalClassAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            attribute.type === 'JSXAttribute' &&
            isJSXIdentifier(attribute.name) &&
            attribute.name.name === 'data-styledeck-class',
        )

        const compiledClassAttribute = node.attributes.find(
          (attribute): attribute is JSXAttribute =>
            attribute.type === 'JSXAttribute' &&
            isJSXIdentifier(attribute.name) &&
            attribute.name.name === htmlClass,
        )

        if (originalClassAttribute == null) {
          return
        }

        if (
          compiledClassAttribute != null &&
          originalClassAttribute.value?.type === 'StringLiteral' &&
          compiledClassAttribute.value?.type === 'StringLiteral'
        ) {
          ms.overwrite(
            compiledClassAttribute.value.start!,
            compiledClassAttribute.value.end!,
            `"${[
              originalClassAttribute.value.value,
              compiledClassAttribute.value.value,
            ].join(' ')}"`,
          )
        }

        const removeStart =
          originalClassAttribute.start! > 0 &&
          // @ts-expect-error FIX: this please
          /\s/u.test(code[originalClassAttribute.start! - 1])
            ? originalClassAttribute.start! - 1
            : originalClassAttribute.start!
        ms.remove(removeStart, originalClassAttribute.end!)
      },
    })

    if (!ms.hasChanged()) {
      return null
    }

    return {
      code: ms.toString().replaceAll(/\s+\/>/gu, ' />'),
    }
  }

import { isJSXIdentifier } from '@babel/types'
import type { JSXAttribute } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { traverse } from '#/shared/traverse'
//
