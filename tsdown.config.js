import { fileURLToPath } from 'node:url'

export { tsdownConfig as default }

/** @type {import('tsdown').UserConfig} */
const tsdownConfig = {
  entry: {
    index: 'src/index.ts',
    'adapters/*': 'src/adapters/*',
  },

  alias: {
    '#': fileURLToPath(new URL('src', import.meta.url)),
  },

  dts: {
    tsconfig: 'tsconfig.build.json',
  },

  minify: true,
  fixedExtension: false,
  format: ['esm', 'cjs'],
}
