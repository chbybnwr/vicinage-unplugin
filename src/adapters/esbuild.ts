export { esbuildPlugin as default }

const esbuildPlugin: (options?: Options) => EsbuildPlugin =
  createEsbuildPlugin(createPlugin)

import { createEsbuildPlugin } from 'unplugin'
import { createPlugin } from '#/plugin'
import type { Plugin as EsbuildPlugin } from 'esbuild'
import type { Options } from '#/plugin'
//
