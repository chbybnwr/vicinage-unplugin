export { babelPlugin as default }

const babelPlugin = declare(function (
  api: PluginAPI,
  options: Options | undefined,
) {
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
import type { PluginAPI } from '@babel/core'
import { pluginName } from '#/shared/config'
import { useTransformPreserveClass } from '#/plugins/preserve-class'
//
