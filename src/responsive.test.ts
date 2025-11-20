import { describe, expect, it } from 'vitest'

import { getResponsiveImageAttributes } from './responsive'

describe('getResponsiveImageAttributes', () => {
  const project = 'test-project'
  const src = 'https://example.com/image.jpg'

  describe('Strategy 1: DPR-based (width only)', () => {
    it('generates 1x and 2x srcSet with x-descriptors', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 800 })

      expect(result.srcSet).toContain(' 1x')
      expect(result.srcSet).toContain(' 2x')
      expect(result.srcSet).not.toContain('w,') // Should not have w-descriptors
      expect(result.srcSet).not.toMatch(/\d+w/) // Should not have width descriptors
    })

    it('rounds width to nearest breakpoint', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 850 })

      // 850 should round up to 1080
      expect(result.width).toBe(1080)
      expect(result.srcSet).toContain('width=1080')
      expect(result.srcSet).toContain('width=2160') // 2x
    })

    it('includes width attribute in return value', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 640 })

      expect(result.width).toBe(640)
    })

    it('generates correct URLs for 1x and 2x', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 750 })

      expect(result.src).toContain('width=750')
      expect(result.srcSet).toContain('width=750')
      expect(result.srcSet).toContain('width=1500') // 2x
    })

    it('uses smallest breakpoint for very small widths', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 10 })

      // Should round up to 640 (smallest default device breakpoint)
      expect(result.width).toBe(640)
    })

    it('uses largest breakpoint for very large widths', () => {
      const result = getResponsiveImageAttributes(project, src, { width: 5000 })

      // Should use 3840 (largest default device breakpoint)
      expect(result.width).toBe(3840)
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

  describe('Strategy 2: Width-based (sizes provided)', () => {
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
      // 50vw on 640px device = 320px minimum
      // Should exclude breakpoints smaller than 320
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '(min-width: 768px) 50vw, 100vw'
      })

      // Should include breakpoints >= 320
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('750w')

      // Should exclude small image breakpoints
      expect(result.srcSet).not.toContain('16w')
      expect(result.srcSet).not.toContain('32w')
      expect(result.srcSet).not.toContain('64w')
      expect(result.srcSet).not.toContain('128w')
      expect(result.srcSet).not.toContain('256w')
    })

    it('uses all breakpoints when sizes has no vw units', () => {
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '(min-width: 768px) 500px, 300px'
      })

      // Should include all device and image breakpoints
      expect(result.srcSet).toContain('16w')
      expect(result.srcSet).toContain('32w')
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('3840w')
    })

    it('includes device and image breakpoints', () => {
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '100vw'
      })

      // Device breakpoints
      expect(result.srcSet).toContain('640w')
      expect(result.srcSet).toContain('1920w')

      // Image breakpoints >= 640 (100vw on 640px device)
      // Small breakpoints (< 640) are filtered out
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

  describe('Strategy 3: Default (neither width nor sizes)', () => {
    it('generates w-descriptor srcSet with device breakpoints', () => {
      const result = getResponsiveImageAttributes(project, src)

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

      expect(result.src).toContain('width=640')
    })
  })

  describe('Custom breakpoints', () => {
    it('uses custom device breakpoints', () => {
      const customBreakpoints = [400, 800, 1200]
      const result = getResponsiveImageAttributes(project, src, {
        deviceBreakpoints: customBreakpoints
      })

      expect(result.srcSet).toContain('400w')
      expect(result.srcSet).toContain('800w')
      expect(result.srcSet).toContain('1200w')
      expect(result.srcSet).not.toContain('640w')
    })

    it('uses custom image breakpoints with sizes', () => {
      const customImageBreakpoints = [700, 900, 1100]
      const result = getResponsiveImageAttributes(project, src, {
        sizes: '100vw',
        imageBreakpoints: customImageBreakpoints
      })

      // Custom breakpoints >= 640 should be included
      expect(result.srcSet).toContain('700w')
      expect(result.srcSet).toContain('900w')
      expect(result.srcSet).toContain('1100w')
    })

    it('rounds to custom breakpoints in DPR strategy', () => {
      const customBreakpoints = [500, 1000, 1500]
      const result = getResponsiveImageAttributes(project, src, {
        width: 750,
        deviceBreakpoints: customBreakpoints
      })

      // 750 should round up to 1000
      expect(result.width).toBe(1000)
      expect(result.srcSet).toContain('width=1000')
      expect(result.srcSet).toContain('width=2000') // 2x
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

      // 33vw on 640px = ~211px minimum
      // Should include 256w and above from image breakpoints
      expect(result.srcSet).toContain('256w')
      expect(result.srcSet).toContain('640w')
    })
  })
})
