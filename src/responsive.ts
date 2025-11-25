import { buildImageUrl } from './urls'

/**
 * Default device breakpoints covering mobile phones to 4K displays
 */
const defaultDeviceBreakpoints = [
  480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840
]

/**
 * Default image breakpoints for small images and icons
 */
const defaultImageBreakpoints = [16, 32, 48, 64, 96, 128, 256, 384]

/**
 * Options for generating responsive image attributes
 */
export interface ResponsiveImageOptions {
  /**
   * Base URL to prepend to relative image URLs.
   * Overrides any globally configured baseUrl for this call only.
   *
   * @example
   * getResponsiveImageAttributes('project', '/images/hero.webp', {
   *   baseUrl: 'https://cdn.example.com'
   * })
   */
  baseUrl?: string
  /**
   * Custom device width breakpoints
   * @default [480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
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
   * Whether to generate responsive image attributes (srcset, sizes)
   * When false, returns only a single src URL
   * @default true
   */
  responsive?: boolean
  /**
   * The HTML sizes attribute value
   * When provided, uses sizes-based strategy with filtered breakpoints
   */
  sizes?: string
  /**
   * The intended display width of the image in pixels
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
 * // Non-responsive (single URL)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg', {
 *   width: 800,
 *   responsive: false
 * })
 * // Returns: { src: '...' }
 *
 * @example
 * // Width-based strategy (width provided, no sizes)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg', {
 *   width: 800
 * })
 * // Returns: { src: '...', srcSet: '... 480w, 640w, 750w, 800w, ..., 1600w, ...', sizes: '(min-width: 1024px) 1024px, 100vw', width: 800 }
 *
 * @example
 * // Sizes-based strategy (with sizes)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg', {
 *   width: 800,
 *   sizes: '(min-width: 768px) 50vw, 100vw'
 * })
 * // Returns: { src: '...', srcSet: '... 640w, ... 750w, ...', sizes: '(min-width: 768px) 50vw, 100vw' }
 *
 * @example
 * // Default strategy (no width or sizes)
 * const attrs = getResponsiveImageAttributes('my-project', 'https://example.com/image.jpg')
 * // Returns: { src: '...', srcSet: '... 480w, 640w, 750w, ...', sizes: '100vw' }
 */
export function getResponsiveImageAttributes(
  project: string,
  src: string,
  options: ResponsiveImageOptions = {}
): ResponsiveImageAttributes {
  const {
    baseUrl,
    width,
    sizes,
    format,
    responsive = true,
    deviceBreakpoints = defaultDeviceBreakpoints,
    imageBreakpoints = defaultImageBreakpoints
  } = options

  // Strategy 0: Non-responsive mode (responsive: false)
  // Returns only a single URL
  if (responsive === false) {
    const singleUrl = buildImageUrl(project, src, { baseUrl, width, format })
    return {
      src: singleUrl,
      srcSet: ''
    }
  }

  // Combine all breakpoints for width-based strategies
  const allBreakpoints = [
    ...deviceBreakpoints,
    ...imageBreakpoints,
    ...(width ? [width, width * 2] : []) // Include width and 2x variant
  ]
  const uniqueBreakpoints = Array.from(new Set(allBreakpoints)).sort(
    (a, b) => a - b
  )

  // Strategy 3: Sizes-based (sizes provided)
  // Uses w-descriptors, filters based on smallest vw value
  if (sizes) {
    const smallestVw = parseSmallestVw(sizes)
    let filteredBreakpoints = uniqueBreakpoints

    // If sizes contains vw units, filter out breakpoints smaller than minimum needed
    if (smallestVw !== null) {
      const minDeviceWidth = 480 // Smallest device we support
      const minImageWidth = minDeviceWidth * smallestVw
      filteredBreakpoints = uniqueBreakpoints.filter(
        (bp) => bp >= minImageWidth
      )
    }

    const srcSetEntries = filteredBreakpoints.map((w) => {
      const url = buildImageUrl(project, src, { baseUrl, width: w, format })
      return `${url} ${w}w`
    })

    // Use the smallest breakpoint as fallback src
    const fallbackWidth = filteredBreakpoints[0] || uniqueBreakpoints[0]
    const fallbackSrc = buildImageUrl(project, src, {
      baseUrl,
      width: fallbackWidth,
      format
    })

    return {
      src: fallbackSrc,
      srcSet: srcSetEntries.join(', '),
      sizes
    }
  }

  // Strategy 2: Width-based (width provided, no sizes)
  // Uses all device breakpoints + width + 2x variant
  if (width) {
    const srcSetEntries = uniqueBreakpoints.map((w) => {
      const url = buildImageUrl(project, src, { baseUrl, width: w, format })
      return `${url} ${w}w`
    })

    // Use the provided width as fallback src
    const fallbackSrc = buildImageUrl(project, src, { baseUrl, width, format })

    return {
      src: fallbackSrc,
      srcSet: srcSetEntries.join(', '),
      sizes: '(min-width: 1024px) 1024px, 100vw',
      width
    }
  }

  // Strategy 1: Default (no width or sizes)
  // Uses all device breakpoints with sizes="100vw"
  const sortedBreakpoints = [...deviceBreakpoints].sort((a, b) => a - b)
  const srcSetEntries = sortedBreakpoints.map((w) => {
    const url = buildImageUrl(project, src, { baseUrl, width: w, format })
    return `${url} ${w}w`
  })

  const fallbackSrc = buildImageUrl(project, src, {
    baseUrl,
    width: sortedBreakpoints[0],
    format
  })

  return {
    src: fallbackSrc,
    srcSet: srcSetEntries.join(', '),
    sizes: '100vw'
  }
}
