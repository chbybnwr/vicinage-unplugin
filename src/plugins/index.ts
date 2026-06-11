/* eslint no-magic-numbers: ["warn", { "ignore": [-1, 0, 1] }] */

export { createPlugin }
export { pluginName }

const pluginName = 'vicinage'

const createPlugin: UnpluginFactory<Options | undefined, true> = (
  options,
  context,
) => {
  const mergeOriginalClass = options?.mergeOriginalClass ?? false

  return [
    ...(mergeOriginalClass ? [preserveClass(options, context)] : []),
    transformProps(options, context),
    transformMacros(options, context),
    ...(mergeOriginalClass ? [mergeClass(options, context)] : []),
  ]
}

import mergeClass from '#/plugins/merge-class/index.js'
import type { Options } from '#/options'
import preserveClass from '#/plugins/preserve-class/index.js'
import transformMacros from '#/plugins/macros'
import transformProps from '#/plugins/props'
import type { UnpluginFactory } from 'unplugin'
//
