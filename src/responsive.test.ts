import { describe, expect, it } from 'vitest'

import { getResponsiveImageAttributes } from './responsive'

describe('getResponsiveImageAttributes', () => {
  const project = 'test-project'
  const src = 'https://example.com/image.jpg'

  describe('Strategy 0: Non-responsive mode (responsive: false)', () => {
    it('returns only src with no srcSet when responsive is false', () => {
      const result = getResponsiveImageAttributes(project, src, {
        responsive: false
      })

      expect(result.src).toBeTruthy()
      expect(result.srcSet).toBe('')
      expect(result.sizes).toBeUndefined()
      expect(result.width).toBeUndefined()
    })

    it('includes width in single URL when provided', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 800,
        responsive: false
      })

      expect(result.src).toContain('width=800')
      expect(result.srcSet).toBe('')
    })

    it('includes format in single URL when specified', () => {
      const result = getResponsiveImageAttributes(project, src, {
        format: 'png',
        responsive: false
      })

      expect(result.src).toContain('format=png')
      expect(result.srcSet).toBe('')
    })
  })

  describe('Strategy 1: Default (no width or sizes)', () => {
    it('generates w-descriptor srcSet with device breakpoints', () => {
      const result = getResponsiveImageAttributes(project, src)

      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('750w')
      expect(result.srcSet).toContain('828w')
      expect(result.srcSet).toContain('1080w')
      expect(result.srcSet).toContain('1200w')
      expect(result.srcSet).toContain('1920w')
      expect(result.srcSet).toContain('2048w')
      expect(result.srcSet).toContain('3840w')
    })

    it('sets sizes to 100vw', () => {
      const result = getResponsiveImageAttributes(project, src)

      expect(result.sizes).toBe('100vw')
    })

    it('does not include width attribute', () => {
      const result = getResponsiveImageAttributes(project, src)

      expect(result.width).toBeUndefined()
    })

    it('does not include image breakpoints by default', () => {
      const result = getResponsiveImageAttributes(project, src)

      expect(result.srcSet).not.toContain('16w')
      expect(result.srcSet).not.toContain('32w')
      expect(result.srcSet).not.toContain('128w')
    })

    it('uses smallest device breakpoint as fallback src', () => {
      const result = getResponsiveImageAttributes(project, src)

      expect(result.src).toContain('width=480')
    })
  })

  describe('Strategy 2: Width-based (width provided, no sizes)', () => {
    it('generates w-descriptor srcSet with all breakpoints + width + 2x', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 800 })

      // Should have w-descriptors
      expect(result.srcSet).toMatch(/\d+w/)
      // Should include all device breakpoints
      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('1920w')
      // Should include provided width and 2x
      expect(result.srcSet).toContain('800w')
      expect(result.srcSet).toContain('1600w') // 2x
    })

    it('includes width attribute in return value', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 640 })

      expect(result.width).toBe(640)
    })

    it('sets sizes to default responsive sizes', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 800 })

      expect(result.sizes).toBe('(min-width: 1024px) 1024px, 100vw')
    })

    it('includes all breakpoints even for small widths', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 10 })

      // Should include all device breakpoints
      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('3840w')
      // Should include provided width and 2x
      expect(result.srcSet).toContain('10w')
      expect(result.srcSet).toContain('20w') // 2x
    })

    it('includes format in URLs when specified', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 800,
        format: 'png'
      })

      expect(result.src).toContain('format=png')
      expect(result.srcSet).toContain('format=png')
    })
  })

  describe('Strategy 3: Sizes-based (sizes provided)', () => {
    it('generates w-descriptor srcSet when sizes provided', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 800,
        sizes: '100vw'
      })

      expect(result.srcSet).toContain('w')
      expect(result.srcSet).not.toContain('1x')
      expect(result.srcSet).not.toContain('2x')
    })

    it('returns the provided sizes attribute', () => {
      const customSizes = '(min-width: 768px) 50vw, 100vw'
      const result = getResponsiveImageAttributes(project, src, {
        width: 800,
        sizes: customSizes
      })

      expect(result.sizes).toBe(customSizes)
    })

    it('does not include width attribute', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 800,
        sizes: '100vw'
      })

      expect(result.width).toBeUndefined()
    })

    it('includes provided width in srcSet', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 999,
        sizes: '100vw'
      })

      expect(result.srcSet).toContain('999w')
    })

    it('filters breakpoints based on smallest vw value', () => {
      // 50vw on 480px device = 240px minimum
      // Should exclude breakpoints smaller than 240
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '(min-width: 768px) 50vw, 100vw'
      })

      // Should include breakpoints >= 240
      expect(result.srcSet).toContain('256w')
      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('750w')

      // Should exclude small image breakpoints
      expect(result.srcSet).not.toContain('16w')
      expect(result.srcSet).not.toContain('32w')
      expect(result.srcSet).not.toContain('64w')
      expect(result.srcSet).not.toContain('128w')
    })

    it('uses all breakpoints when sizes has no vw units', () => {
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '(min-width: 768px) 500px, 300px'
      })

      // Should include all device and image breakpoints
      expect(result.srcSet).toContain('16w')
      expect(result.srcSet).toContain('32w')
      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('3840w')
    })

    it('includes device and image breakpoints', () => {
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '100vw'
      })

      // Device breakpoints
      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('1920w')

      // Image breakpoints >= 480 (100vw on 480px device)
      // Small breakpoints (< 480) are filtered out
      expect(result.srcSet).not.toContain('16w')
      expect(result.srcSet).not.toContain('128w')
      expect(result.srcSet).not.toContain('384w')
    })

    it('removes duplicate breakpoints', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 640, // Matches a device breakpoint
        sizes: '100vw'
      })

      // Should only appear once
      const matches = result.srcSet.match(/640w/g)
      expect(matches?.length).toBe(1)
    })
  })

  describe('Custom breakpoints', () => {
    it('uses custom device breakpoints in default strategy', () => {
      const customBreakpoints = [400, 800, 1200]
      const result = getResponsiveImageAttributes(project, src, {
        deviceBreakpoints: customBreakpoints
      })

      expect(result.srcSet).toContain('400w')
      expect(result.srcSet).toContain('800w')
      expect(result.srcSet).toContain('1200w')
      expect(result.srcSet).not.toContain('480w')
      expect(result.srcSet).not.toContain('640w')
    })

    it('uses custom image breakpoints with sizes', () => {
      const customImageBreakpoints = [700, 900, 1100]
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '100vw',
        imageBreakpoints: customImageBreakpoints
      })

      // Custom breakpoints >= 480 should be included
      expect(result.srcSet).toContain('700w')
      expect(result.srcSet).toContain('900w')
      expect(result.srcSet).toContain('1100w')
    })

    it('includes custom breakpoints in width-based strategy', () => {
      const customBreakpoints = [500, 1000, 1500]
      const result = getResponsiveImageAttributes(project, src, {
        width: 750,
        deviceBreakpoints: customBreakpoints
      })

      // Should include custom breakpoints + width + 2x
      expect(result.srcSet).toContain('500w')
      expect(result.srcSet).toContain('750w')
      expect(result.srcSet).toContain('1000w')
      expect(result.srcSet).toContain('1500w')
      expect(result.srcSet).toContain('1500w') // 2x of 750
    })
  })

  describe('Format handling', () => {
    it('defaults to webp format', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 800 })

      expect(result.src).toContain('format=webp')
      expect(result.srcSet).toContain('format=webp')
    })

    it('uses png format when specified', () => {
      const result = getResponsiveImageAttributes(project, src, {
        width: 800,
        format: 'png'
      })

      expect(result.src).toContain('format=png')
      expect(result.srcSet).toContain('format=png')
    })

    it('applies format to all srcSet entries', () => {
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '100vw',
        format: 'png'
      })

      const pngCount = (result.srcSet.match(/format=png/g) || []).length
      const srcSetEntries = result.srcSet.split(',').length

      expect(pngCount).toBe(srcSetEntries)
    })
  })

  describe('Edge cases', () => {
    it('handles URLs with special characters', () => {
      const specialSrc = 'https://example.com/image with spaces.jpg?v=1&foo=bar'
      const result = getResponsiveImageAttributes(project, specialSrc, {
        width: 800
      })

      expect(result.src).toContain('pixelpuppy.io')
      // URL encoding can vary (%20 or + for spaces), just check it's encoded
      expect(result.src).toContain('url=')
      expect(result.src).toMatch(/url=https%3A%2F%2Fexample\.com%2Fimage/)
    })

    it('sorts breakpoints in ascending order', () => {
      const result = getResponsiveImageAttributes(project, src, {
        deviceBreakpoints: [1920, 640, 1200, 828]
      })

      const widths =
        result.srcSet.match(/(\d+)w/g)?.map((w) => parseInt(w)) || []
      const sorted = [...widths].sort((a, b) => a - b)

      expect(widths).toEqual(sorted)
    })

    it('handles sizes with multiple vw values correctly', () => {
      // Should use 33vw (smallest) for filtering
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw'
      })

      // 33vw on 480px = ~158px minimum
      // Should include 256w and above from image breakpoints
      expect(result.srcSet).toContain('256w')
      expect(result.srcSet).toContain('480w')
      expect(result.srcSet).toContain('640w')
    })
  })
})
