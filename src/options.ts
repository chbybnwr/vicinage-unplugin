export type { Options }

/**
 * @public
 */
interface Options {
  applyAs?: 'props' | 'attrs'
  mergeOriginalClass?: boolean
  aliases?: {
    styleDeck?: string
  }
}
