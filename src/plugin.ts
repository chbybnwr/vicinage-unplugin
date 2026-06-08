/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

export { createPlugin }
export { pluginName }

const pluginName = 'vicinage'

const createPlugin: UnpluginFactory<Options | undefined> = (options) => [
  {
    name: pluginName,
    enforce: 'pre',

    transform: {
      filter: {
        id: /\.(?<file>t|j)sx?$/u,
      },

      handler: useTransformPreserveClass(options),
    },
  },

  {
    name: pluginName,
    enforce: 'pre',

    transform: {
      filter: {
        id: /\.(?<file>t|j)sx?$/u,
      },

      handler: useTransformProps(options),
    },
  },

  {
    name: pluginName,
    enforce: 'pre',

    transform: {
      filter: {
        id: /\.(?<file>t|j)sx?$/u,
      },

      handler: useTransformMacros(options),
    },
  },

  {
    name: pluginName,

    transform: {
      filter: {
        id: /\.(?<file>t|j)sx?$/u,
      },

      handler: useTransformMergeClass(options),
    },
  },
]

import type { Options } from '#/options'
import type { UnpluginFactory } from 'unplugin'
import { useTransformMacros } from '#/transform-macros.js'
import { useTransformMergeClass } from '#/transform-merge-class.js'
import { useTransformPreserveClass } from '#/transform-preserve-class.js'
import { useTransformProps } from '#/transform-props.js'
