export { preset as default }

function preset(api: object, options: Options) {
  return {
    plugins: [
      [preStylex, options],
      [
        stylex,
        {
          classNamePrefix: 's',
          enableInlinedConditionalMerge: true,
          treeshakeCompensation: true,
          unstable_moduleResolution: {
            type: 'commonJS',
          },
          ...options,
        },
      ],
      [postStylex, options],
    ],
  }
}

import type { Options } from '#/options'
import postStylex from '#/adapters/babel-post'
import preStylex from '#/adapters/babel-pre'
import stylex from '@stylexjs/babel-plugin'
//
