export { preset as default }

function preset(api: object, options: Options) {
  const { applyAs, unstyledComponentModules, ...stylexOptions } = options
  const styledeckOptions = { applyAs, unstyledComponentModules }

  return {
    plugins: [
      [preStylex, styledeckOptions],
      [
        stylex,
        {
          classNamePrefix: 's',
          enableInlinedConditionalMerge: true,
          treeshakeCompensation: true,
          unstable_moduleResolution: {
            type: 'commonJS',
          },
          ...stylexOptions,
        },
      ],
      [postStylex, styledeckOptions],
    ],
  }
}

import type { Options } from '#/options'
import postStylex from '#/adapters/babel-post'
import preStylex from '#/adapters/babel-pre'
import stylex from '@stylexjs/babel-plugin'
//
