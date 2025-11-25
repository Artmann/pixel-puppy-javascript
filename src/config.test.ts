import { describe, it, expect, beforeEach } from 'vitest'

import { configure, getConfig, resetConfig } from './config'

describe('config', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('configure', () => {
    it('sets global configuration', () => {
      configure({ baseUrl: 'https://example.com' })

      expect(getConfig().baseUrl).toBe('https://example.com')
    })

    it('replaces previous configuration', () => {
      configure({ baseUrl: 'https://first.com' })
      configure({ baseUrl: 'https://second.com' })

      expect(getConfig().baseUrl).toBe('https://second.com')
    })

    it('allows empty configuration', () => {
      configure({ baseUrl: 'https://example.com' })
      configure({})

      expect(getConfig().baseUrl).toBeUndefined()
    })
  })

  describe('getConfig', () => {
    it('returns empty object by default', () => {
      const config = getConfig()

      expect(config.baseUrl).toBeUndefined()
    })

    it('returns frozen object', () => {
      configure({ baseUrl: 'https://example.com' })
      const config = getConfig()

      expect(Object.isFrozen(config)).toBe(true)
    })

    it('returns a copy, not the original', () => {
      configure({ baseUrl: 'https://example.com' })
      const config1 = getConfig()
      const config2 = getConfig()

      expect(config1).not.toBe(config2)
      expect(config1).toEqual(config2)
    })
  })

  describe('resetConfig', () => {
    it('clears all configuration', () => {
      configure({ baseUrl: 'https://example.com' })
      resetConfig()

      expect(getConfig().baseUrl).toBeUndefined()
    })
  })
})
