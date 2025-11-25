import { describe, it, expect, beforeEach } from 'vitest'

import { configure, resetConfig } from './config'
import { buildImageUrl } from './urls'

describe('buildImageUrl', () => {
  const projectSlug = 'test-project'
  const imageUrl = 'https://example.com/image.jpg'

  describe('basic functionality', () => {
    it('builds URL with required parameters and default format', () => {
      const result = buildImageUrl(projectSlug, imageUrl)

      expect(result).toBe(
        'https://pixelpuppy.io/api/image?project=test-project&url=https%3A%2F%2Fexample.com%2Fimage.jpg&format=webp'
      )
    })

    it('includes width when provided', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { width: 800 })

      expect(result).toContain('width=800')
      expect(result).toContain('format=webp')
    })

    it('uses custom format when provided', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { format: 'png' })

      expect(result).toContain('format=png')
      expect(result).not.toContain('format=webp')
    })

    it('includes both format and width when provided', () => {
      const result = buildImageUrl(projectSlug, imageUrl, {
        format: 'png',
        width: 1200
      })

      expect(result).toContain('format=png')
      expect(result).toContain('width=1200')
    })

    it('properly encodes URL parameters', () => {
      const urlWithSpecialChars =
        'https://example.com/image.jpg?foo=bar&baz=qux'
      const result = buildImageUrl(projectSlug, urlWithSpecialChars)

      expect(result).toContain(
        'url=https%3A%2F%2Fexample.com%2Fimage.jpg%3Ffoo%3Dbar%26baz%3Dqux'
      )
    })
  })

  describe('validation', () => {
    it('throws error when projectSlug is missing', () => {
      expect(() => buildImageUrl('', imageUrl)).toThrow(
        'projectSlug is required'
      )
    })

    it('throws error when originalImageUrl is missing', () => {
      expect(() => buildImageUrl(projectSlug, '')).toThrow(
        'originalImageUrl is required'
      )
    })

    it('throws error when format is invalid', () => {
      expect(() =>
        buildImageUrl(projectSlug, imageUrl, { format: 'jpeg' as any })
      ).toThrow('Invalid format. Supported formats are webp and png.')
    })

    it('throws error when width is NaN', () => {
      expect(() =>
        buildImageUrl(projectSlug, imageUrl, { width: NaN })
      ).toThrow('Width must be a number.')
    })

    it('treats width of zero as omitted', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { width: 0 })

      expect(result).not.toContain('width=')
    })

    it('throws error when width is negative', () => {
      expect(() =>
        buildImageUrl(projectSlug, imageUrl, { width: -100 })
      ).toThrow('Width must be a positive number.')
    })
  })

  describe('format handling', () => {
    it('accepts webp format', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { format: 'webp' })

      expect(result).toContain('format=webp')
    })

    it('accepts png format', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { format: 'png' })

      expect(result).toContain('format=png')
    })

    it('converts format to lowercase', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { format: 'webp' })

      expect(result).toContain('format=webp')
      expect(result).not.toContain('format=WEBP')
    })
  })

  describe('width handling', () => {
    it('accepts valid positive width', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { width: 500 })

      expect(result).toContain('width=500')
    })

    it('omits width parameter when not provided', () => {
      const result = buildImageUrl(projectSlug, imageUrl)

      expect(result).not.toContain('width=')
    })

    it('omits width parameter when undefined', () => {
      const result = buildImageUrl(projectSlug, imageUrl, { width: undefined })

      expect(result).not.toContain('width=')
    })
  })

  describe('real-world URL handling', () => {
    const realWorldUrls = [
      'https://userjot.com/assets/blog/canal-maze.webp',
      'https://userjot.com/assets/hero/dashboard-v1.webp',
      'https://plus.unsplash.com/premium_photo-1691095182210-a1b3c46a31d6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://www.producthunt.com/',
      'https://ph-files.imgix.net/be0214b8-59a1-46be-beb2-e146ad83dc49.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=888&h=178&fit=max&frame=1&dpr=1',
      'https://app.roaarrr.app/_next/static/media/logo.53dcc4c6.svg',
      'https://assets.calendly.com/mfe/mf-publisher/frontend/media/calendly-wordmark-0da6c58d9a06b08c975f.svg',
      'https://images.ctfassets.net/k0lk9kiuza3o/o2HGgowwA0pGWLzVj5p2U/021d2a8973d8d88bdf61f478a06c26be/Extension-Feature_image.png?w=1984&h=1483&q=85',
      'https://images.ctfassets.net/k0lk9kiuza3o/1BmFGciFJEEJH0NAKZKxN7profile/0794ff9ac0bbb47cffe218341ced9cf2/Hilary-Yeganegi-Calendly.png?w=480&h=480&q=85',
      'https://lh7-rt.googleusercontent.com/docsz/AD_4nXc_55a3F2gHI1adw4k2QNLpLFR-4Ob3xV1_P3EiPpem03EzEPYZrRD6dHO_AzTqWhEvouDLcjLBViTNRLLiYbnNUDGXIh1U0FUTe16oV1JcEH3_CbQgcafugZ_ZjVjxqbdSlVbR?key=24hSwdHxYTNSUsAYO7qWQw'
    ]

    it.each(realWorldUrls)('properly encodes URL: %s', (url) => {
      const result = buildImageUrl(projectSlug, url)

      expect(result).toContain('project=test-project')
      expect(result).toContain('format=webp')
      // Verify the URL is properly encoded as a query parameter
      expect(result).toContain('url=')
      // Should not contain raw special characters in the final URL
      expect(decodeURIComponent(result)).toContain(url)
    })

    it.each(realWorldUrls)('handles URL with width: %s', (url) => {
      const result = buildImageUrl(projectSlug, url, { width: 800 })

      expect(result).toContain('width=800')
      expect(decodeURIComponent(result)).toContain(url)
    })

    it.each(realWorldUrls)('handles URL with PNG format: %s', (url) => {
      const result = buildImageUrl(projectSlug, url, { format: 'png' })

      expect(result).toContain('format=png')
      expect(decodeURIComponent(result)).toContain(url)
    })
  })

  describe('common image sizes', () => {
    const mobileSizes = [
      { name: 'iPhone SE', width: 320 },
      { name: 'iPhone 12/13', width: 375 },
      { name: 'iPhone 12/13 Pro Max', width: 414 },
      { name: 'iPad Mini', width: 768 }
    ]

    const desktopSizes = [
      { name: 'Laptop', width: 1024 },
      { name: 'Desktop', width: 1440 },
      { name: 'Full HD', width: 1920 }
    ]

    describe('mobile sizes', () => {
      it.each(mobileSizes)(
        'generates URL for $name ($width px) with webp',
        ({ width }) => {
          const result = buildImageUrl(projectSlug, imageUrl, {
            width,
            format: 'webp'
          })

          expect(result).toContain(`width=${width}`)
          expect(result).toContain('format=webp')
        }
      )

      it.each(mobileSizes)(
        'generates URL for $name ($width px) with png',
        ({ width }) => {
          const result = buildImageUrl(projectSlug, imageUrl, {
            width,
            format: 'png'
          })

          expect(result).toContain(`width=${width}`)
          expect(result).toContain('format=png')
        }
      )
    })

    describe('desktop sizes', () => {
      it.each(desktopSizes)(
        'generates URL for $name ($width px) with webp',
        ({ width }) => {
          const result = buildImageUrl(projectSlug, imageUrl, {
            width,
            format: 'webp'
          })

          expect(result).toContain(`width=${width}`)
          expect(result).toContain('format=webp')
        }
      )

      it.each(desktopSizes)(
        'generates URL for $name ($width px) with png',
        ({ width }) => {
          const result = buildImageUrl(projectSlug, imageUrl, {
            width,
            format: 'png'
          })

          expect(result).toContain(`width=${width}`)
          expect(result).toContain('format=png')
        }
      )
    })
  })

  describe('combination matrix', () => {
    const sampleUrls = [
      'https://userjot.com/assets/blog/canal-maze.webp',
      'https://plus.unsplash.com/premium_photo-1691095182210-a1b3c46a31d6?q=80&w=687',
      'https://ph-files.imgix.net/be0214b8-59a1-46be-beb2-e146ad83dc49.png?auto=compress'
    ]

    const sizes = [375, 768, 1440]
    const formats = ['webp', 'png'] as const

    it.each(sampleUrls)(
      'URL with complex query params handles all size/format combinations: %s',
      (url) => {
        sizes.forEach((width) => {
          formats.forEach((format) => {
            const result = buildImageUrl(projectSlug, url, { width, format })

            expect(result).toContain('project=test-project')
            expect(result).toContain(`width=${width}`)
            expect(result).toContain(`format=${format}`)
            expect(decodeURIComponent(result)).toContain(url)
          })
        })
      }
    )

    it('generates correct URL for complex real-world scenario', () => {
      const complexUrl =
        'https://images.ctfassets.net/k0lk9kiuza3o/o2HGgowwA0pGWLzVj5p2U/021d2a8973d8d88bdf61f478a06c26be/Extension-Feature_image.png?w=1984&h=1483&q=85'

      const result = buildImageUrl(projectSlug, complexUrl, {
        width: 1200,
        format: 'webp'
      })

      expect(result).toBe(
        `https://pixelpuppy.io/api/image?project=test-project&url=${encodeURIComponent(complexUrl)}&format=webp&width=1200`
      )
    })
  })

  describe('relative URL support', () => {
    beforeEach(() => {
      resetConfig()
    })

    it('resolves relative URLs with baseUrl option', () => {
      const result = buildImageUrl(projectSlug, '/images/hero.webp', {
        baseUrl: 'https://example.com'
      })

      expect(result).toContain(
        'url=https%3A%2F%2Fexample.com%2Fimages%2Fhero.webp'
      )
    })

    it('resolves relative URLs with global config', () => {
      configure({ baseUrl: 'https://example.com' })
      const result = buildImageUrl(projectSlug, '/images/hero.webp')

      expect(result).toContain(
        'url=https%3A%2F%2Fexample.com%2Fimages%2Fhero.webp'
      )
    })

    it('prefers baseUrl option over global config', () => {
      configure({ baseUrl: 'https://global.example.com' })
      const result = buildImageUrl(projectSlug, '/images/hero.webp', {
        baseUrl: 'https://override.example.com'
      })

      expect(result).toContain('override.example.com')
      expect(result).not.toContain('global.example.com')
    })

    it('passes through absolute URLs unchanged', () => {
      const result = buildImageUrl(projectSlug, 'https://other.com/image.jpg', {
        baseUrl: 'https://example.com' // Should be ignored
      })

      expect(result).toContain('url=https%3A%2F%2Fother.com%2Fimage.jpg')
      expect(result).not.toContain('example.com%2Fimage')
    })

    it('throws descriptive error for relative URL without configuration', () => {
      expect(() => buildImageUrl(projectSlug, '/images/hero.webp')).toThrow(
        'Cannot resolve relative URL'
      )
    })

    it('handles relative URL with width and format options', () => {
      const result = buildImageUrl(projectSlug, '/images/hero.webp', {
        baseUrl: 'https://example.com',
        width: 800,
        format: 'png'
      })

      expect(result).toContain(
        'url=https%3A%2F%2Fexample.com%2Fimages%2Fhero.webp'
      )
      expect(result).toContain('width=800')
      expect(result).toContain('format=png')
    })

    it('handles bare relative paths (without leading slash)', () => {
      const result = buildImageUrl(projectSlug, 'images/hero.webp', {
        baseUrl: 'https://example.com'
      })

      expect(result).toContain(
        'url=https%3A%2F%2Fexample.com%2Fimages%2Fhero.webp'
      )
    })

    it('handles relative URLs with query strings', () => {
      const result = buildImageUrl(projectSlug, '/images/hero.webp?v=123', {
        baseUrl: 'https://example.com'
      })

      expect(decodeURIComponent(result)).toContain(
        'https://example.com/images/hero.webp?v=123'
      )
    })
  })
})
