export type { Options }

/**
 * @public
 */
interface Options {
  applyAs?: 'props' | 'attrs'

  /**
   * @default false
   */
  overwriteClass?: boolean

  unstyledComponentModules?: string[]
}
