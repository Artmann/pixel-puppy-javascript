import { describe, it, expect, beforeEach } from 'vitest'

import { configure, resetConfig } from './config'
import { isRelativeUrl, resolveUrl } from './url-utils'

describe('isRelativeUrl', () => {
  it('returns true for paths starting with /', () => {
    expect(isRelativeUrl('/images/hero.webp')).toBe(true)
    expect(isRelativeUrl('/path/to/image.jpg')).toBe(true)
    expect(isRelativeUrl('/')).toBe(true)
  })

  it('returns true for bare paths without leading slash', () => {
    expect(isRelativeUrl('images/hero.webp')).toBe(true)
    expect(isRelativeUrl('image.jpg')).toBe(true)
  })

  it('returns true for relative paths with ./', () => {
    expect(isRelativeUrl('./images/hero.webp')).toBe(true)
    expect(isRelativeUrl('../images/hero.webp')).toBe(true)
  })

  it('returns false for absolute URLs with https', () => {
    expect(isRelativeUrl('https://example.com/image.jpg')).toBe(false)
    expect(isRelativeUrl('https://cdn.example.com/path/to/image.webp')).toBe(
      false
    )
  })

  it('returns false for absolute URLs with http', () => {
    expect(isRelativeUrl('http://example.com/image.jpg')).toBe(false)
  })

  it('returns false for protocol-relative URLs (//) ', () => {
    expect(isRelativeUrl('//cdn.example.com/image.jpg')).toBe(false)
    expect(isRelativeUrl('//example.com/path/image.webp')).toBe(false)
  })

  it('returns false for data URLs', () => {
    expect(isRelativeUrl('data:image/png;base64,abc123')).toBe(false)
  })
})

describe('resolveUrl', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('absolute URLs', () => {
    it('returns absolute URLs unchanged', () => {
      expect(resolveUrl('https://example.com/image.jpg')).toBe(
        'https://example.com/image.jpg'
      )
    })

    it('returns absolute URLs unchanged even with baseUrl parameter', () => {
      expect(
        resolveUrl('https://other.com/image.jpg', 'https://example.com')
      ).toBe('https://other.com/image.jpg')
    })

    it('returns protocol-relative URLs unchanged', () => {
      expect(resolveUrl('//cdn.example.com/image.jpg')).toBe(
        '//cdn.example.com/image.jpg'
      )
    })

    it('returns data URLs unchanged', () => {
      const dataUrl = 'data:image/png;base64,abc123'
      expect(resolveUrl(dataUrl)).toBe(dataUrl)
    })
  })

  describe('with baseUrl parameter', () => {
    it('prepends baseUrl to paths starting with /', () => {
      expect(resolveUrl('/images/hero.webp', 'https://example.com')).toBe(
        'https://example.com/images/hero.webp'
      )
    })

    it('prepends baseUrl to bare paths', () => {
      expect(resolveUrl('images/hero.webp', 'https://example.com')).toBe(
        'https://example.com/images/hero.webp'
      )
    })

    it('handles baseUrl with trailing slash', () => {
      expect(resolveUrl('/images/hero.webp', 'https://example.com/')).toBe(
        'https://example.com/images/hero.webp'
      )
    })

    it('handles baseUrl with path', () => {
      expect(resolveUrl('/images/hero.webp', 'https://example.com/app')).toBe(
        'https://example.com/app/images/hero.webp'
      )
    })
  })

  describe('with global config', () => {
    it('uses global config when no baseUrl parameter provided', () => {
      configure({ baseUrl: 'https://global.example.com' })

      expect(resolveUrl('/images/hero.webp')).toBe(
        'https://global.example.com/images/hero.webp'
      )
    })

    it('prefers parameter baseUrl over global config', () => {
      configure({ baseUrl: 'https://global.example.com' })

      expect(
        resolveUrl('/images/hero.webp', 'https://override.example.com')
      ).toBe('https://override.example.com/images/hero.webp')
    })
  })

  describe('error handling', () => {
    it('throws descriptive error for relative URL without baseUrl', () => {
      expect(() => resolveUrl('/images/hero.webp')).toThrow(
        'Cannot resolve relative URL'
      )
    })

    it('throws error with guidance on how to configure', () => {
      expect(() => resolveUrl('/images/hero.webp')).toThrow('configure')
    })

    it('mentions browser auto-detection in error message', () => {
      expect(() => resolveUrl('/images/hero.webp')).toThrow(
        'window.location.origin'
      )
    })
  })

  describe('edge cases', () => {
    it('handles complex relative paths', () => {
      expect(
        resolveUrl('/path/to/deeply/nested/image.webp', 'https://example.com')
      ).toBe('https://example.com/path/to/deeply/nested/image.webp')
    })

    it('handles paths with query strings', () => {
      expect(
        resolveUrl('/images/hero.webp?v=123', 'https://example.com')
      ).toBe('https://example.com/images/hero.webp?v=123')
    })

    it('handles paths with fragments', () => {
      expect(
        resolveUrl('/images/hero.webp#section', 'https://example.com')
      ).toBe('https://example.com/images/hero.webp#section')
    })
  })
})
