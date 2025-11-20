import { buildImageUrl } from './urls'

/**
 * Default device breakpoints covering mobile phones to 4K displays
 */
const defaultDeviceBreakpoints = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]

/**
 * Default image breakpoints for small images and icons
 */
const defaultImageBreakpoints = [16, 32, 48, 64, 96, 128, 256, 384]

/**
 * Options for generating responsive image attributes
 */
export interface ResponsiveImageOptions {
  /**
   * Custom device width breakpoints
   * @default [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
   */
  deviceBreakpoints?: number[]
  /**
   * The desired image format
   */
  format?: 'webp' | 'png'
  /**
   * Custom image width breakpoints (concatenated with deviceBreakpoints)
   * @default [16, 32, 48, 64, 96, 128, 256, 384]
   */
  imageBreakpoints?: number[]
  /**
   * The HTML sizes attribute value
   * When provided, uses width-based strategy with w-descriptors
   */
  sizes?: string
  /**
   * The intended display width of the image in pixels
   * Used for DPR-based strategy when sizes is not provided
   */
  width?: number
}

/**
 * Generated responsive image attributes for use in img tags
 */
export interface ResponsiveImageAttributes {
  /**
   * The sizes attribute value (only present for width-based strategy)
   */
  sizes?: string
  /**
   * The src attribute value (fallback image URL)
   */
  src: string
  /**
   * The srcSet attribute value with multiple image candidates
   */
  srcSet: string
  /**
   * The width attribute value (only present for DPR-based strategy)
   */
  width?: number
}

function roundToNearestBreakpoint(
  value: number,
  breakpoints: number[]
): number {
  const sorted = [...breakpoints].sort((a, b) => a - b)

  for (const breakpoint of sorted) {
    if (breakpoint >= value) {
      return breakpoint
    }
  }

  if (sorted.length === 0) {
    return value
  }

  return sorted[sorted.length - 1] ?? value
}

/**
 * Parses the smallest vw value from a sizes attribute string
 * Returns the percentage as a decimal (e.g., "50vw" returns 0.5)
 */
function parseSmallestVw(sizes: string): number | null {
  const vwMatches = sizes.match(/(\d+)vw/g)

  if (!vwMatches || vwMatches.length === 0) {
    return null
  }

  const vwValues = vwMatches.map((match) => {
    const num = match.match(/(\d+)/)
    return num?.[1] ? parseInt(num[1], 10) : 100
  })

  const smallestVw = Math.min(...vwValues)
  return smallestVw / 100
}

/**
 * Generates responsive image attributes for use in img tags
 *
 * @param project - The Pixel Puppy project identifier
 * @param src - The original image URL
 * @param options - Responsive image options
 * @returns Object with src, srcSet, and optionally sizes and width attributes
 *
 * @example
 * // DPR-based strategy (width only)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg', {
 *   width: 800
 * })
 * // Returns: { src: '...', srcSet: '... 1x, ... 2x', width: 800 }
 *
 * @example
 * // Width-based strategy (with sizes)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg', {
 *   width: 800,
 *   sizes: '(min-width: 768px) 50vw, 100vw'
 * })
 * // Returns: { src: '...', srcSet: '... 640w, ... 750w, ...', sizes: '(min-width: 768px) 50vw, 100vw' }
 *
 * @example
 * // Default strategy (neither provided)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg')
 * // Returns: { src: '...', srcSet: '... 640w, ... 750w, ...', sizes: '100vw' }
 */
export function getResponsiveImageAttributes(
  project: string,
  src: string,
  options: ResponsiveImageOptions = {}
): ResponsiveImageAttributes {
  const {
    width,
    sizes,
    format,
    deviceBreakpoints = defaultDeviceBreakpoints,
    imageBreakpoints = defaultImageBreakpoints
  } = options

  // Strategy 1: DPR-based (width provided, no sizes)
  // Uses x-descriptors for 1x and 2x pixel density
  if (width && !sizes) {
    const rounded = roundToNearestBreakpoint(width, deviceBreakpoints)
    const url1x = buildImageUrl(project, src, { width: rounded, format })
    const url2x = buildImageUrl(project, src, { width: rounded * 2, format })

    return {
      src: url1x,
      srcSet: `${url1x} 1x, ${url2x} 2x`,
      width: rounded
    }
  }

  // Combine all breakpoints for width-based strategies
  const allBreakpoints = [
    ...deviceBreakpoints,
    ...imageBreakpoints,
    ...(width ? [width] : [])
  ]
  const uniqueBreakpoints = Array.from(new Set(allBreakpoints)).sort(
    (a, b) => a - b
  )

  // Strategy 2: Width-based (sizes provided)
  // Uses w-descriptors, filters based on smallest vw value
  if (sizes) {
    const smallestVw = parseSmallestVw(sizes)
    let filteredBreakpoints = uniqueBreakpoints

    // If sizes contains vw units, filter out breakpoints smaller than minimum needed
    if (smallestVw !== null) {
      const minDeviceWidth = 640 // Smallest device we support
      const minImageWidth = minDeviceWidth * smallestVw
      filteredBreakpoints = uniqueBreakpoints.filter(
        (bp) => bp >= minImageWidth
      )
    }

    const srcSetEntries = filteredBreakpoints.map((w) => {
      const url = buildImageUrl(project, src, { width: w, format })
      return `${url} ${w}w`
    })

    // Use the smallest breakpoint as fallback src
    const fallbackWidth = filteredBreakpoints[0] || uniqueBreakpoints[0]
    const fallbackSrc = buildImageUrl(project, src, {
      width: fallbackWidth,
      format
    })

    return {
      src: fallbackSrc,
      srcSet: srcSetEntries.join(', '),
      sizes
    }
  }

  // Strategy 3: Default (neither width nor sizes provided)
  // Uses all device breakpoints with sizes="100vw"
  const sortedBreakpoints = [...deviceBreakpoints].sort((a, b) => a - b)
  const srcSetEntries = sortedBreakpoints.map((w) => {
    const url = buildImageUrl(project, src, { width: w, format })
    return `${url} ${w}w`
  })

  const fallbackSrc = buildImageUrl(project, src, {
    width: sortedBreakpoints[0],
    format
  })

  return {
    src: fallbackSrc,
    srcSet: srcSetEntries.join(', '),
    sizes: '100vw'
  }
}
