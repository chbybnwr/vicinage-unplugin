/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

export { astroPlugin as default }

function astroPlugin(options: Options): any {
  return {
    name: pluginName,
    hooks: {
      'astro:config:setup': (astro: AstroContext) => {
        astro.config.vite.plugins ??= []
        astro.config.vite.plugins.push(unplugin.vite(options))
      },
    },
  }
}

interface AstroContext {
  config: {
    vite: {
      plugins?: unknown[]
    }
  }
}

import type { Options } from '#/plugin'
import { pluginName } from '#/plugin'
import { unplugin } from '#/adapters/unplugin'
//
