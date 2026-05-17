/// <reference types="vitest/config" />

export { vitestConfig as default }

/** @type {import("vite").UserConfig} */
const vitestConfig = {
  test: {
    coverage: {
      exclude: ['src/test/**/*'],
    },

    projects: [
      {
        resolve: {
          alias: {
            '#': fileURLToPath(new URL('src', import.meta.url)),
          },
        },

        test: {
          name: 'unit',
        },
      },
    ],
  },
}

import { fileURLToPath } from 'node:url'
//
