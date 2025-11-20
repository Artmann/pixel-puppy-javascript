import invariant from 'tiny-invariant'

interface TransformationOptions {
  // The desired image format. Defaults to 'webp'.
  format?: 'webp' | 'png'
  // The desired width of the image in pixels.
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
 * @param options.format - The desired output format ('webp' or 'png'). Defaults to 'webp'
 * @param options.width - The desired width in pixels. Maintains aspect ratio when resizing
 *
 * @returns The complete Pixel Puppy transformation URL
 *
 * @throws {Error} When projectSlug is not provided
 * @throws {Error} When originalImageUrl is not provided
 * @throws {Error} When format is not 'webp' or 'png'
 * @throws {Error} When width is not a valid number
 * @throws {Error} When width is not a positive number
 *
 * @example
 * Basic usage with defaults (WebP format):
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg')
 * // Returns: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp
 * ```
 *
 * @example
 * Resize to specific width:
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', { width: 800 })
 * // Returns: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=webp&width=800
 * ```
 *
 * @example
 * Convert to PNG format:
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', { format: 'png' })
 * // Returns: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=png
 * ```
 *
 * @example
 * Resize and convert format:
 * ```ts
 * const url = buildImageUrl('my-project', 'https://example.com/photo.jpg', {
 *   format: 'png',
 *   width: 1200
 * })
 * // Returns: https://pixelpuppy.io/api/image?project=my-project&url=https://example.com/photo.jpg&format=png&width=1200
 * ```
 */
export function buildImageUrl(
  projectSlug: string,
  originalImageUrl: string,
  options: TransformationOptions = {}
): string {
  invariant(projectSlug, 'projectSlug is required.')
  invariant(originalImageUrl, 'originalImageUrl is required.')

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
  params.append('url', originalImageUrl)

  params.append('format', format.toLowerCase())

  if (width) {
    params.append('width', width.toString())
  }

  return `${baseUrl}?${params.toString()}`
}
