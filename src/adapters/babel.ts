export { babelPlugin as default }

const babelPlugin = declare(function (
  api: PluginAPI,
  options: Options | undefined,
) {
  api.assertVersion(7)

  const transformerList = [
    useTransformProps(options),
    useTransformMacros(options),
    //
  ]

  return {
    name: pluginName,

    visitor: {
      Program(path, state) {
        const { filename } = state

        if (
          !(
            filename != null &&
            !filename.includes('node_modules') &&
            /\.(?<js>t|j)sx?$/u.test(filename)
          )
        ) {
          return
        }

        let result: string | undefined

        for (const transform of transformerList) {
          result = transform(result ?? state.file.code, filename)?.code
        }

        if (result == null) {
          return
        }

        state.file.code = result

        const ast = parse(result, {
          sourceType: 'module',
          plugins: [
            'typescript',
            'jsx',
            //
          ],
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
import { useTransformMacros } from '#/plugins/macros'
import { useTransformProps } from '#/plugins/props/index.js'
//
