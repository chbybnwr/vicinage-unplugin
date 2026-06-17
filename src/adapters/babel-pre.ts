/* eslint-disable no-param-reassign */
export { babelPlugin as default }

const babelPlugin: (
  api: object,
  options: Options | null | undefined,
  dirname: string,
) => PluginObj = declare((api, options) => {
  // eslint-disable-next-line no-magic-numbers
  api.assertVersion(7)

  const transform = useTransformPreserveClass(options)

  return {
    name: pluginName,

    visitor: {
      Program(path, state) {
        const { filename } = state

        if (!(filename != null && /\.(?<js>t|j)sx?$/u.test(filename))) {
          return
        }

        const result = transform(state.file.code, filename)?.code

        if (result == null) {
          return
        }

        state.file.code = result

        const ast = parse(result, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        })

        path.node.body = ast.program.body
        path.node.directives = ast.program.directives
      },
    },
  }
})

import { declare } from '@babel/helper-plugin-utils'
import type { Options } from '#/options'
import { parse } from '@babel/parser'
import { pluginName } from '#/shared/config'
import type { PluginObj } from '@babel/core'
import { useTransformPreserveClass } from '#/plugins/preserve-class'
//
