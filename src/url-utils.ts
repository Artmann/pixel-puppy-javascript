import { getConfig } from './config'

/**
 * Checks if a URL is relative (needs a base URL to resolve)
 *
 * @param url - The URL to check
 * @returns true if the URL is relative, false if absolute
 *
 * @example
 * isRelativeUrl('/images/hero.webp') // true
 * isRelativeUrl('images/hero.webp') // true
 * isRelativeUrl('https://example.com/image.jpg') // false
 * isRelativeUrl('//cdn.example.com/image.jpg') // false (protocol-relative)
 */
export function isRelativeUrl(url: string): boolean {
  if (url.startsWith('//')) {
    return false
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return false
  }

  if (url.startsWith('data:')) {
    return false
  }

  return true
}

/**
 * Gets the base URL from browser environment if available
 */
function getBrowserBaseUrl(): string | undefined {
  if (typeof globalThis !== 'undefined') {
    const win = globalThis as typeof globalThis & {
      location?: { origin?: string }
    }

    if (win.location?.origin) {
      return win.location.origin
    }
  }

  return undefined
}

/**
 * Resolves a potentially relative URL to an absolute URL.
 * Returns the original URL unchanged if it's already absolute.
 *
 * Resolution priority:
 * 1. If URL is absolute, return as-is
 * 2. Use provided baseUrl parameter
 * 3. Use globally configured baseUrl
 * 4. Auto-detect from browser (window.location.origin)
 * 5. Throw error if no baseUrl available
 *
 * @param url - The URL to resolve
 * @param baseUrl - Optional base URL to use (overrides global config)
 * @returns The resolved absolute URL
 * @throws {Error} if the URL is relative and no baseUrl is available
 *
 * @example
 * // With explicit baseUrl
 * resolveUrl('/images/hero.webp', 'https://example.com')
 * // Returns: 'https://example.com/images/hero.webp'
 *
 * @example
 * // With global config
 * configure({ baseUrl: 'https://example.com' })
 * resolveUrl('/images/hero.webp')
 * // Returns: 'https://example.com/images/hero.webp'
 *
 * @example
 * // Absolute URLs pass through unchanged
 * resolveUrl('https://other.com/image.jpg', 'https://example.com')
 * // Returns: 'https://other.com/image.jpg'
 */
export function resolveUrl(url: string, baseUrl?: string): string {
  if (!isRelativeUrl(url)) {
    return url
  }

  // Get baseUrl from: 1) parameter, 2) global config, 3) browser auto-detect
  const config = getConfig()
  const effectiveBaseUrl = baseUrl ?? config.baseUrl ?? getBrowserBaseUrl()

  if (!effectiveBaseUrl) {
    throw new Error(
      `Cannot resolve relative URL "${url}". ` +
        `Please configure a baseUrl using configure({ baseUrl: '...' }) ` +
        `or pass baseUrl in options. ` +
        `In browser environments, this is auto-detected from window.location.origin.`
    )
  }

  // Normalize: remove trailing slash from base, ensure path starts with slash
  const normalizedBase = effectiveBaseUrl.replace(/\/$/, '')
  const normalizedPath = url.startsWith('/') ? url : `/${url}`

  return `${normalizedBase}${normalizedPath}`
}
