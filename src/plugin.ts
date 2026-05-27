/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

export { createPlugin }
export { pluginName }

const pluginName = 'vicinage'

const createPlugin: UnpluginFactory<Options | undefined, false> = (
  options,
) => ({
  name: pluginName,
  enforce: 'pre',

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler: useTransformMacros(options),
  },
})

import type { Options } from '#/options'
import type { UnpluginFactory } from 'unplugin'
import { useTransformMacros } from '#/transform-macros.js'
