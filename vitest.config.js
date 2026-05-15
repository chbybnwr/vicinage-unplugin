export { vitestConfig as default }

const vitestConfig = defineConfig({
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
})

import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
//
