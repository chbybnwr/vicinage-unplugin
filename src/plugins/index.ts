export { createPlugin }

const createPlugin: UnpluginFactory<Options | undefined, true> = (
  options,
  context,
) => {
  const overwriteClass = options?.overwriteClass ?? false
  const applyAs = options?.applyAs ?? 'props'

  return [
    ...(overwriteClass
      ? []
      : [
          preserveClass(options, context),
          mergeClass(options, context),
          //
        ]),
    transformProps(options, context),
    transformMacros(options, context),
    ...(applyAs === 'attrs'
      ? [
          swapAttrs(options, context),
          //
        ]
      : []),
  ]
}

import mergeClass from '#/plugins/merge-class/index.js'
import type { Options } from '#/options'
import preserveClass from '#/plugins/preserve-class/index.js'
import swapAttrs from '#/plugins/swap-attrs'
import transformMacros from '#/plugins/macros'
import transformProps from '#/plugins/props'
import type { UnpluginFactory } from 'unplugin'
//
