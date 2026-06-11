/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

export { createPlugin }
export { pluginName }

const pluginName = 'vicinage'

const createPlugin: UnpluginFactory<Options | undefined> = (options) => {
  const mergeOriginalClass = options?.mergeOriginalClass ?? false

  return [
    ...((mergeOriginalClass
      ? [
          {
            name: `${pluginName}:class`,
            enforce: 'pre',

            transform: {
              filter: {
                id: /\.(?<file>t|j)sx?$/u,
              },

              handler: useTransformPreserveClass(options),
            },
          },
        ]
      : []) satisfies UnpluginOptions[]),

    {
      name: `${pluginName}:prop`,
      enforce: 'pre',

      transform: {
        filter: {
          id: /\.(?<file>t|j)sx?$/u,
        },

        handler: useTransformProps(options),
      },
    },

    {
      name: `${pluginName}:macros`,
      enforce: 'pre',

      transform: {
        filter: {
          id: /\.(?<file>t|j)sx?$/u,
        },

        handler: useTransformMacros(options),
      },
    },

    ...((mergeOriginalClass
      ? [
          {
            name: `${pluginName}:merge`,

            transform: {
              filter: {
                id: /\.(?<file>t|j)sx?$/u,
              },

              handler: useTransformMergeClass(options),
            },
          },
        ]
      : []) satisfies UnpluginOptions[]),
  ]
}

import type { Options } from '#/options'
import type { UnpluginFactory } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import { useTransformMacros } from '#/transform-macros.js'
import { useTransformMergeClass } from '#/transform-merge-class.js'
import { useTransformPreserveClass } from '#/transform-preserve-class.js'
import { useTransformProps } from '#/plugins/props'
