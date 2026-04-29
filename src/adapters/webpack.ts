export { webpackPlugin as default }

const webpackPlugin: (options?: Options) => WebpackPluginInstance =
  createWebpackPlugin(createPlugin)

import { createPlugin } from '#/plugin'
import { createWebpackPlugin } from 'unplugin'
import type { Options } from '#/plugin'
import type { WebpackPluginInstance } from 'unplugin'
//
