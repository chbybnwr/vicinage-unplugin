/* eslint-disable no-param-reassign */
export { babelPlugin as default }

const babelPlugin: (
  api: object,
  options: Options | null | undefined,
  dirname: string,
) => PluginObj = declare((api, options) => {
  // eslint-disable-next-line no-magic-numbers
  api.assertVersion(7)

  const transformMacros = useTransformMacros(options)
  const transformProps = useTransformProps(options)

  return {
    name: pluginName,

    visitor: {
      Program(path, state) {
        const { filename } = state

        if (!(filename != null && /\.(?<js>t|j)sx?$/u.test(filename))) {
          return
        }

        const result = (() => {
          // eslint-disable-next-line init-declarations
          let x

          x = transformMacros(state.file.code, filename)?.code
          x = transformProps(x ?? state.file.code, filename)?.code

          return x
        })()

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
import { pluginName } from '#/plugins/index.js'
import type { PluginObj } from '@babel/core'
import { useTransformMacros } from '#/plugins/macros'
import { useTransformProps } from '#/plugins/props/index.js'
//
