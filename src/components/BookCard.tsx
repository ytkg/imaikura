import { useEffect, useState } from 'react'
import { BookOpen, Check, CircleAlert, Pencil, RefreshCw, RotateCcw, Trash2, X } from 'lucide-react'
import { formatYen } from '../lib/money'
import type { Book } from '../types'

interface BookCardProps {
  book: Book
  onUpdate: (update: Partial<Book>) => void
  onRemove: () => void
  onRetry: () => void
}

export function BookCard({ book, onUpdate, onRemove, onRetry }: BookCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(book.title)
  const [price, setPrice] = useState(book.price?.toString() ?? '')

  useEffect(() => {
    setTitle(book.title)
    setPrice(book.price?.toString() ?? '')
  }, [book.title, book.price])

  const save = () => {
    const parsed = price === '' ? null : Number(price)
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) return
    onUpdate({
      title: title.trim(),
      price: parsed,
      priceEdited: parsed !== book.openBdPrice,
      status: book.status === 'not-found' ? 'ready' : book.status,
    })
    setEditing(false)
  }

  return (
    <article className={`book-card ${book.included ? '' : 'book-card--held'}`}>
      <button
        className={`include-control ${book.included ? 'include-control--active' : ''}`}
        type="button"
        aria-label={book.included ? `${book.title || book.isbn}を保留にする` : `${book.title || book.isbn}を合計に含める`}
        onClick={() => onUpdate({ included: !book.included })}
      >
        {book.included ? <Check size={17} strokeWidth={3} /> : null}
      </button>

      <div className="book-cover" aria-hidden="true">
        {book.coverUrl ? <img src={book.coverUrl} alt="" /> : <BookOpen size={24} />}
      </div>

      <div className="book-details">
        {book.status === 'loading' ? (
          <div className="book-loading"><span className="spinner" /> 書籍情報を取得中</div>
        ) : (
          <>
            <h3>{book.title || 'タイトル未入力'}</h3>
            {book.authors.length > 0 ? <p className="book-authors">{book.authors.join('、')}</p> : null}
          </>
        )}
        <p className="book-isbn">ISBN {book.isbn}</p>

        {book.status === 'error' ? (
          <button className="inline-action error-text" type="button" onClick={onRetry}>
            <RefreshCw size={14} /> 通信エラー・再試行
          </button>
        ) : null}
        {book.status === 'not-found' ? (
          <p className="warning-text"><CircleAlert size={14} /> OpenBDに未収録</p>
        ) : null}

        <div className="price-row">
          {book.price === null ? (
            <span className="price-missing">価格入力が必要</span>
          ) : (
            <strong>税抜 {formatYen(book.price)}</strong>
          )}
          {book.priceEdited ? <span className="edited-badge">変更済み</span> : null}
        </div>
      </div>

      <div className="book-actions">
        <button className="icon-button" type="button" aria-label="書籍情報と価格を編集" title="編集" onClick={() => setEditing(true)}>
          <Pencil size={18} />
        </button>
        <button className="icon-button icon-button--danger" type="button" aria-label="この本を削除" title="削除" onClick={onRemove}>
          <Trash2 size={18} />
        </button>
      </div>

      {editing ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby={`edit-${book.isbn}`}>
            <header className="modal-header">
              <h2 id={`edit-${book.isbn}`}>書籍情報を編集</h2>
              <button className="icon-button" type="button" aria-label="閉じる" onClick={() => setEditing(false)}><X /></button>
            </header>
            <label className="field-label">
              タイトル
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="タイトル（任意）" />
            </label>
            <label className="field-label">
              税抜価格
              <div className="price-input-wrap">
                <input aria-label="税抜価格" inputMode="numeric" pattern="[0-9]*" value={price} onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))} placeholder="0" />
                <span>円</span>
              </div>
            </label>
            {book.openBdPrice !== null && book.priceEdited ? (
              <button className="secondary-button" type="button" onClick={() => setPrice(book.openBdPrice!.toString())}>
                <RotateCcw size={16} /> 取得価格（{formatYen(book.openBdPrice)}）に戻す
              </button>
            ) : null}
            <button className="primary-button" type="button" onClick={save}>保存する</button>
          </section>
        </div>
      ) : null}
    </article>
  )
}
