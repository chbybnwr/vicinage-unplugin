export { nuxtModule as default }
export type { ModuleOptions }

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ModuleOptions extends Options {
  //
}

const nuxtModule: NuxtModule<ModuleOptions, ModuleOptions> =
  defineNuxtModule<ModuleOptions>({
    meta: {
      name: pluginName,
      configKey: pluginName,
    },
    defaults: {
      // ...default options
    },
    setup(options: ModuleOptions, _nuxt) {
      addVitePlugin(() => vitePlugin(options))
      addWebpackPlugin(() => webpackPlugin(options))
    },
  })

import { addVitePlugin } from '@nuxt/kit'
import { addWebpackPlugin } from '@nuxt/kit'
import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import type { Options } from '#/options'
import { pluginName } from '#/shared/config'
import { vitePlugin } from '#/adapters/vite'
import webpackPlugin from '#/adapters/webpack'
//
