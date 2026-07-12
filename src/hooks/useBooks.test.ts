import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBooks } from './useBooks'
import { fetchOpenBdBook } from '../lib/openbd'

vi.mock('../lib/openbd', () => ({ fetchOpenBdBook: vi.fn() }))
const mockedFetch = vi.mocked(fetchOpenBdBook)

beforeEach(() => {
  localStorage.clear()
  mockedFetch.mockReset()
  mockedFetch.mockResolvedValue({ title: '取得した本', authors: ['著者'], coverUrl: null, price: 1200 })
})

describe('useBooks', () => {
  it('adds once, rejects duplicates, and fills metadata asynchronously', async () => {
    const { result } = renderHook(() => useBooks())
    let first = false
    let duplicate = true
    act(() => {
      first = result.current.addBook('9784101010014')
      duplicate = result.current.addBook('9784101010014')
    })
    expect(first).toBe(true)
    expect(duplicate).toBe(false)
    expect(result.current.books).toHaveLength(1)
    await waitFor(() => expect(result.current.books[0].status).toBe('ready'))
    expect(result.current.books[0]).toMatchObject({ title: '取得した本', price: 1200 })
    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })

  it('moves a book between included and held collections', async () => {
    const { result } = renderHook(() => useBooks())
    act(() => { result.current.addBook('9784101010014') })
    await waitFor(() => expect(result.current.books[0].status).toBe('ready'))
    act(() => result.current.updateBook('9784101010014', { included: false }))
    expect(result.current.includedBooks).toHaveLength(0)
    expect(result.current.heldBooks).toHaveLength(1)
  })

  it('removes and restores a book', async () => {
    const { result } = renderHook(() => useBooks())
    act(() => { result.current.addBook('9784101010014') })
    await waitFor(() => expect(result.current.books).toHaveLength(1))
    act(() => result.current.removeBook('9784101010014'))
    expect(result.current.books).toHaveLength(0)
    expect(result.current.deleted?.book.isbn).toBe('9784101010014')
    act(() => result.current.undoRemove())
    expect(result.current.books).toHaveLength(1)
  })

  it('preserves an edited price when metadata is retried', async () => {
    const { result } = renderHook(() => useBooks())
    act(() => { result.current.addBook('9784101010014') })
    await waitFor(() => expect(result.current.books[0].status).toBe('ready'))
    act(() => result.current.updateBook('9784101010014', { price: 1500, priceEdited: true }))
    mockedFetch.mockResolvedValue({ title: '更新後', authors: [], coverUrl: null, price: 1300 })
    await act(async () => { await result.current.retryBook('9784101010014') })
    expect(result.current.books[0]).toMatchObject({ openBdPrice: 1300, price: 1500, priceEdited: true })
  })

  it('distinguishes missing records from network errors', async () => {
    mockedFetch.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('offline'))
    const { result } = renderHook(() => useBooks())
    act(() => {
      result.current.addBook('9784101010014')
      result.current.addBook('9784101010021')
    })
    await waitFor(() => expect(result.current.books.every((book) => book.status !== 'loading')).toBe(true))
    expect(result.current.books.map((book) => book.status).sort()).toEqual(['error', 'not-found'])
  })
})

