import invariant from 'tiny-invariant'

import { resolveUrl } from './url-utils'

/**
 * Options for image transformation
 */
export interface TransformationOptions {
  /**
   * Base URL to prepend to relative image URLs.
   * Overrides any globally configured baseUrl for this call only.
   *
   * @example
   * buildImageUrl('project', '/images/hero.webp', { baseUrl: 'https://cdn.example.com' })
   */
  baseUrl?: string
  /**
   * The desired image format. Defaults to 'webp'.
   */
  format?: 'webp' | 'png'
  /**
   * The desired width of the image in pixels.
   */
  width?: number
}

/**
 * Builds a URL for the Pixel Puppy image transformation API.
 *
 * This function constructs a properly formatted URL that can be used to transform
 * images through the Pixel Puppy service. The service supports format conversion
 * (WebP, PNG) and resizing operations.
 *
 * @param projectSlug - The project identifier for your Pixel Puppy account
 * @param originalImageUrl - The URL of the original image to transform
 * @param options - Optional transformation settings
 * @param options.baseUrl - Base URL for resolving relative image URLs
 * @param options.format - The desired output format ('webp' or 'png'). Defaults to 'webp'
 * @param options.width - The desired width in pixels. Maintains aspect ratio when resizing
 *
 * @returns The complete Pixel Puppy transformation URL
 *
 * @throws {Error} When projectSlug is not provided
 * @throws {Error} When originalImageUrl is not provided
 * @throws {Error} When originalImageUrl is relative and no baseUrl is configured
 * @throws {Error} When format is not 'webp' or 'png'
 * @throws {Error} When width is not a valid number
 * @throws {Error} When width is not a positive number
 *
 * @example
 * Basic usage with absolute URL:
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg')
 * // Returns: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp
 * ```
 *
 * @example
 * Relative URL with baseUrl option:
 * ```ts
 * const url = buildImageUrl('my-project', '/images/hero.webp', { baseUrl: 'https://example.com' })
 * // Resolves to: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/images/hero.webp&format=webp
 * ```
 *
 * @example
 * Relative URL with global config (browser auto-detects from window.location.origin):
 * ```ts
 * // In browser: works automatically
 * const url = buildImageUrl('my-project', '/images/hero.webp')
 *
 * // In SSR/Node: configure once at startup
 * configure({ baseUrl: 'https://example.com' })
 * const url = buildImageUrl('my-project', '/images/hero.webp')
 * ```
 *
 * @example
 * Resize to specific width:
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', { width: 800 })
 * ```
 *
 * @example
 * Convert to PNG format:
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', { format: 'png' })
 * ```
 */
export function buildImageUrl(
  projectSlug: string,
  originalImageUrl: string,
  options: TransformationOptions = {}
): string {
  invariant(projectSlug, 'projectSlug is required.')
  invariant(originalImageUrl, 'originalImageUrl is required.')

  // Resolve relative URLs to absolute
  const resolvedUrl = resolveUrl(originalImageUrl, options.baseUrl)

  const baseUrl = `https://pixelpuppy.io/api/image`
  const params = new URLSearchParams()

  const format = options.format || 'webp'
  const width = options.width

  if (format !== 'webp' && format !== 'png') {
    throw new Error('Invalid format. Supported formats are webp and png.')
  }

  if (Number.isNaN(width)) {
    throw new Error('Width must be a number.')
  }

  if (width && width <= 0) {
    throw new Error('Width must be a positive number.')
  }

  params.append('project', projectSlug)
  params.append('url', resolvedUrl)

  params.append('format', format.toLowerCase())

  if (width) {
    params.append('width', width.toString())
  }

  return `${baseUrl}?${params.toString()}`
}
