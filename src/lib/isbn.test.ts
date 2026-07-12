import { describe, expect, it } from 'vitest'
import { isValidIsbn10, isValidIsbn13, normalizeIsbn } from './isbn'

describe('ISBN utilities', () => {
  it('accepts a valid ISBN-13 with hyphens', () => {
    expect(normalizeIsbn('978-4-10-101001-4')).toBe('9784101010014')
  })

  it('converts ISBN-10 to ISBN-13', () => {
    expect(isValidIsbn10('4-10-101001-3')).toBe(true)
    expect(normalizeIsbn('4-10-101001-3')).toBe('9784101010014')
  })

  it('rejects invalid check digits and non-book EANs', () => {
    expect(isValidIsbn13('9784101010015')).toBe(false)
    expect(normalizeIsbn('1920095018004')).toBeNull()
  })
})
