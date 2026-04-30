# @vicinage/unplugin

Universal bundler plugin for [Vicinage](https://github.com/chbybnwr/vicinage).

## Setup

```bash
npm install --save-dev @vicinage/unplugin @stylexjs/unplugin
```

Put Vicinage before StyleX.

```ts
import { defineConfig } from 'vite'
import vicinage from '@vicinage/unplugin'
import stylex from '@stylexjs/unplugin'

export default defineConfig({
  plugins: [vicinage.vite(), stylex.vite()],
})
```
