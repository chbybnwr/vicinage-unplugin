export type { Options }

/**
 * @public
 */
interface Options {
  applyAs?: 'props' | 'attrs'
  mergeOriginalClass?: boolean
  unstyledComponentModules?: string[]
  aliases?: {
    styleDeck?: string
  }
}
