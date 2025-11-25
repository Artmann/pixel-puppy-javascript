/**
 * Global configuration options for the Pixel Puppy library
 */
export interface PixelPuppyConfig {
  /**
   * Base URL to prepend to relative image URLs.
   * Examples: 'https://example.com', 'https://cdn.example.com'
   *
   * In browser environments, this is auto-detected from window.location.origin
   * if not explicitly set.
   */
  baseUrl?: string
}

let globalConfig: PixelPuppyConfig = {}

/**
 * Configure global defaults for the Pixel Puppy library.
 * Call this once at application startup.
 *
 * In browser environments, baseUrl is auto-detected from window.location.origin
 * so you typically don't need to call this function.
 *
 * In SSR/Node environments, you must configure a baseUrl to use relative URLs.
 *
 * @example
 * // In SSR/Node.js app initialization
 * configure({ baseUrl: 'https://example.com' })
 *
 * // Now relative URLs work everywhere
 * buildImageUrl('my-project', '/images/hero.webp')
 *
 * @example
 * // In Next.js
 * configure({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL })
 */
export function configure(config: PixelPuppyConfig): void {
  globalConfig = { ...config }
}

/**
 * Get the current configuration
 */
export function getConfig(): Readonly<PixelPuppyConfig> {
  return Object.freeze({ ...globalConfig })
}

/**
 * Reset configuration to defaults (useful for testing)
 */
export function resetConfig(): void {
  globalConfig = {}
}
