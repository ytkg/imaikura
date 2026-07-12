import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchOpenBdBook } from '../lib/openbd'
import { loadBooks, saveBooks } from '../lib/storage'
import type { Book, DeletedBook } from '../types'

function pendingBook(isbn: string): Book {
  return {
    isbn,
    title: '',
    authors: [],
    coverUrl: null,
    openBdPrice: null,
    price: null,
    priceEdited: false,
    included: true,
    status: 'loading',
    addedAt: Date.now(),
  }
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(loadBooks)
  const booksRef = useRef(books)
  const [deleted, setDeleted] = useState<DeletedBook | null>(null)

  useEffect(() => {
    booksRef.current = books
    saveBooks(books)
  }, [books])

  const fetchMetadata = useCallback(async (isbn: string) => {
    setBooks((current) => current.map((book) => book.isbn === isbn ? { ...book, status: 'loading' } : book))
    try {
      const result = await fetchOpenBdBook(isbn)
      setBooks((current) => current.map((book) => {
        if (book.isbn !== isbn) return book
        if (!result) return { ...book, status: 'not-found' }
        return {
          ...book,
          title: result.title,
          authors: result.authors,
          coverUrl: result.coverUrl,
          openBdPrice: result.price,
          price: book.priceEdited ? book.price : result.price,
          status: 'ready',
        }
      }))
    } catch {
      setBooks((current) => current.map((book) => book.isbn === isbn ? { ...book, status: 'error' } : book))
    }
  }, [])

  const addBook = useCallback((isbn: string): boolean => {
    if (booksRef.current.some((book) => book.isbn === isbn)) return false
    const next = [pendingBook(isbn), ...booksRef.current]
    booksRef.current = next
    setBooks(next)
    void fetchMetadata(isbn)
    return true
  }, [fetchMetadata])

  useEffect(() => {
    const retry = () => {
      books.filter((book) => book.status === 'error').forEach((book) => void fetchMetadata(book.isbn))
    }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [books, fetchMetadata])

  const updateBook = useCallback((isbn: string, update: Partial<Book>) => {
    setBooks((current) => current.map((book) => book.isbn === isbn ? { ...book, ...update } : book))
  }, [])

  const removeBook = useCallback((isbn: string) => {
    setBooks((current) => {
      const index = current.findIndex((book) => book.isbn === isbn)
      if (index < 0) return current
      setDeleted({ book: current[index], index })
      return current.filter((book) => book.isbn !== isbn)
    })
  }, [])

  const undoRemove = useCallback(() => {
    if (!deleted) return
    setBooks((current) => {
      const next = [...current]
      next.splice(Math.min(deleted.index, next.length), 0, deleted.book)
      return next
    })
    setDeleted(null)
  }, [deleted])

  const includedBooks = useMemo(() => books.filter((book) => book.included), [books])
  const heldBooks = useMemo(() => books.filter((book) => !book.included), [books])

  return {
    books,
    includedBooks,
    heldBooks,
    deleted,
    addBook,
    updateBook,
    removeBook,
    undoRemove,
    clearDeleted: () => setDeleted(null),
    clearBooks: () => setBooks([]),
    retryBook: fetchMetadata,
  }
}
