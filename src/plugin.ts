/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

export { createPlugin }
export { pluginName }
export type { Options }

const pluginName = 'vicinage'

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Options {}

const createPlugin: UnpluginFactory<Options | undefined, false> = () => ({
  name: pluginName,
  enforce: 'pre',

  transform: {
    filter: {
      id: /\.(?<file>t|j)sx?$/u,
    },

    handler,
  },
})

import { handler } from '#/handler.js'
import type { UnpluginFactory } from 'unplugin'
//
