/* eslint-disable no-continue */
export { useTransformMergeClass }

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

const pluginName = 'vicinage'
const synthesizedMergeLocalName = '__styledeck_mergeClass'

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

        const spreadAttribute = node.attributes.find(
          (attribute): attribute is JSXSpreadAttribute =>
            attribute.type === 'JSXSpreadAttribute' &&
            attribute.argument.type === 'CallExpression' &&
            isStylexHelperCall(attribute.argument, stylexHelpers),
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
        } else if (compiledClassAttribute != null) {
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
        } else if (spreadAttribute != null) {
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

  if (attribute.value.type === 'JSXExpressionContainer') {
    return code.slice(
      attribute.value.expression.start!,
      attribute.value.expression.end!,
    )
  }

  if (attribute.value.type === 'StringLiteral') {
    return `'${attribute.value.value.replaceAll("'", String.raw`\'`)}'`
  }

  return code.slice(attribute.value.start!, attribute.value.end!)
}

function isStylexHelperCall(
  node: CallExpression,
  helperNames: Set<string>,
): boolean {
  if (node.callee.type === 'Identifier') {
    return helperNames.has(node.callee.name)
  }

  if (node.callee.type === 'MemberExpression') {
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
        statement.type === 'ImportDeclaration' &&
        statement.source.value === '@stylexjs/stylex'
      )
    ) {
      continue
    }

    for (const specifier of statement.specifiers) {
      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported.type === 'Identifier'
      ) {
        const importedName = specifier.imported.name
        const localName = specifier.local.name

        if (importedName === helperName) {
          names.add(localName)
        }
      }

      if (specifier.type === 'ImportNamespaceSpecifier') {
        names.add(`${specifier.local.name}.${helperName}`)
      }
    }
  }

  return names
}

import type { CallExpression } from '@babel/types'
import { isIdentifier } from '@babel/types'
import { isJSXIdentifier } from '@babel/types'
import type { JSXAttribute } from '@babel/types'
import type { JSXSpreadAttribute } from '@babel/types'
import MagicString from 'magic-string'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { traverse } from '#/shared/traverse'
//
