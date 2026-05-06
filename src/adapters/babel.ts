/* eslint-disable no-param-reassign */
export { babelPlugin as default }

const babelPlugin: (
  api: object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Record<string, any> | null | undefined,
  dirname: string,
) => PluginObj = declare((api) => {
  // eslint-disable-next-line no-magic-numbers
  api.assertVersion(7)

  return {
    name: pluginName,

    visitor: {
      Program(path, state) {
        const { filename } = state

        if (!(filename != null && /\.(?<js>t|j)sx?$/u.test(filename))) {
          return
        }

        const source = state.file.code
        const result = handler(source, filename)

        if (result?.code) {
          state.file.code = result.code

          const ast = parse(result.code, {
            sourceType: 'module',
            plugins: [
              'typescript',
              'jsx',
              //
            ],
          })

          path.node.body = ast.program.body
          path.node.directives = ast.program.directives
        }
      },
    },
  }
})

import { declare } from '@babel/helper-plugin-utils'
import { handler } from '#/handler.js'
import { parse } from '@babel/parser'
import { pluginName } from '#/plugin.js'
import type { PluginObj } from '@babel/core'
//
