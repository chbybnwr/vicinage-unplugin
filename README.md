# @vicinage/unplugin &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/chbybnwr/vicinage-unplugin/blob/prototype/LICENSE) [![npm version](https://img.shields.io/npm/v/@vicinage/unplugin.svg?style=flat)](https://www.npmjs.com/package/@vicinage/unplugin)

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
