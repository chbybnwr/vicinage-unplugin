export { createPlugin }

const createPlugin: UnpluginFactory<Options | undefined, true> = (
  options,
  context,
) => {
  const overwriteClass = options?.overwriteClass ?? false

  return [
    ...(overwriteClass ? [] : [preserveClass]),
    transformProps,
    transformMacros,
    postProcess,
  ].map((createPlugin) => createPlugin(options, context))
}

import type { Options } from '#/options'
import postProcess from '#/plugins/post-process'
import preserveClass from '#/plugins/preserve-class/index.js'
import transformMacros from '#/plugins/macros'
import transformProps from '#/plugins/props'
import type { UnpluginFactory } from 'unplugin'
//
