import { beforeEach, describe, expect, it } from 'vitest'
import { loadBooks, saveBooks } from './storage'
import type { Book } from '../types'

const savedBook: Book = {
  isbn: '9784101010014', title: '保存する本', authors: ['著者'], coverUrl: null,
  openBdPrice: 900, price: 1000, priceEdited: true, included: false,
  status: 'ready', addedAt: 123,
}

beforeEach(() => localStorage.clear())

describe('book storage', () => {
  it('round-trips the complete book state', () => {
    saveBooks([savedBook])
    expect(loadBooks()).toEqual([savedBook])
  })

  it('returns an empty list for malformed data', () => {
    localStorage.setItem('imaikura:books:v1', '{broken')
    expect(loadBooks()).toEqual([])
  })

  it('ignores non-book values', () => {
    localStorage.setItem('imaikura:books:v1', JSON.stringify([null, 3, { title: 'ISBNなし' }]))
    expect(loadBooks()).toEqual([])
  })
})

