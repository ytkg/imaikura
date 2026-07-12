import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookCard } from './BookCard'
import type { Book } from '../types'

const baseBook: Book = {
  isbn: '9784101010014', title: 'テストの本', authors: ['著者'], coverUrl: null,
  openBdPrice: 1000, price: 1000, priceEdited: false, included: true,
  status: 'ready', addedAt: 1,
}

describe('BookCard', () => {
  it('requests moving an included book to held', () => {
    const onUpdate = vi.fn()
    render(<BookCard book={baseBook} onUpdate={onUpdate} onRemove={vi.fn()} onRetry={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'テストの本を保留にする' }))
    expect(onUpdate).toHaveBeenCalledWith({ included: false })
  })

  it('edits title and price and marks the price as changed', () => {
    const onUpdate = vi.fn()
    render(<BookCard book={baseBook} onUpdate={onUpdate} onRemove={vi.fn()} onRetry={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '書籍情報と価格を編集' }))
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '店頭の本' } })
    fireEvent.change(screen.getByLabelText('税抜価格'), { target: { value: '1250' } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: '店頭の本', price: 1250, priceEdited: true }))
  })

  it('offers the original OpenBD price for an edited book', () => {
    render(<BookCard book={{ ...baseBook, price: 1250, priceEdited: true }} onUpdate={vi.fn()} onRemove={vi.fn()} onRetry={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '書籍情報と価格を編集' }))
    fireEvent.click(screen.getByRole('button', { name: /取得価格/ }))
    expect(screen.getByLabelText('税抜価格')).toHaveValue('1000')
  })
})
