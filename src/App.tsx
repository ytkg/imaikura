import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Info, MoreVertical, ScanBarcode, Trash2, Undo2 } from 'lucide-react'
import { About } from './components/About'
import { BookCard } from './components/BookCard'
import { useBooks } from './hooks/useBooks'
import { calculateTotals, formatYen } from './lib/money'

const Scanner = lazy(() => import('./components/Scanner').then((module) => ({ default: module.Scanner })))

export default function App() {
  const {
    books, includedBooks, heldBooks, deleted, addBook, updateBook, removeBook,
    undoRemove, clearDeleted, clearBooks, retryBook,
  } = useBooks()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const totals = useMemo(() => calculateTotals(books), [books])

  const detected = useCallback((isbn: string) => addBook(isbn), [addBook])

  useEffect(() => {
    if (!deleted) return
    const timeout = window.setTimeout(clearDeleted, 5000)
    return () => window.clearTimeout(timeout)
  }, [deleted, clearDeleted])

  const confirmClear = () => {
    setMenuOpen(false)
    if (window.confirm('購入予定と保留の本をすべて削除しますか？')) clearBooks()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="./" aria-label="いまいくら ホーム">
          <span className="brand-mark"><BookOpen size={21} /><i aria-hidden="true" /></span>
          <span>いまいくら</span>
        </a>
        <div className="menu-wrap">
          <button className="icon-button" type="button" aria-label="メニュー" onClick={() => setMenuOpen((open) => !open)}>
            <MoreVertical />
          </button>
          {menuOpen ? (
            <div className="overflow-menu">
              <button type="button" onClick={() => { setMenuOpen(false); setAboutOpen(true) }}><Info size={17} /> このアプリについて</button>
              <button type="button" className="danger-text" disabled={books.length === 0} onClick={confirmClear}><Trash2 size={17} /> すべて削除</button>
            </div>
          ) : null}
        </div>
      </header>

      <main className={`book-list ${books.length === 0 ? 'book-list--empty' : ''}`}>
        {books.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon"><BookOpen size={34} /><span aria-hidden="true" /></div>
            <h1>選んだ本を<br />スキャンしよう</h1>
            <p>合計金額をその場で確認できます</p>
            <button className="primary-button scan-cta" type="button" onClick={() => setScannerOpen(true)}>
              <ScanBarcode size={20} /> スキャンする
            </button>
          </section>
        ) : (
          <>
            <section className="book-section" aria-labelledby="included-heading">
              <div className="section-heading">
                <h2 id="included-heading">購入予定</h2>
                <span>{includedBooks.length}冊</span>
              </div>
              {includedBooks.length === 0 ? <p className="section-empty">合計に含める本はありません</p> : null}
              {includedBooks.map((book) => (
                <BookCard key={book.isbn} book={book} onUpdate={(update) => updateBook(book.isbn, update)} onRemove={() => removeBook(book.isbn)} onRetry={() => void retryBook(book.isbn)} />
              ))}
            </section>

            {heldBooks.length > 0 ? (
              <section className="book-section held-section" aria-labelledby="held-heading">
                <div className="section-heading">
                  <h2 id="held-heading">保留</h2>
                  <span>{heldBooks.length}冊</span>
                </div>
                {heldBooks.map((book) => (
                  <BookCard key={book.isbn} book={book} onUpdate={(update) => updateBook(book.isbn, update)} onRemove={() => removeBook(book.isbn)} onRetry={() => void retryBook(book.isbn)} />
                ))}
              </section>
            ) : null}
          </>
        )}
      </main>

      {books.length > 0 ? (
        <button className="floating-scan" type="button" aria-label="本をスキャン" title="本をスキャン" onClick={() => setScannerOpen(true)}>
          <ScanBarcode />
        </button>
      ) : null}

      <footer className="totals" aria-label="合計金額">
        {totals.missingCount > 0 ? <p className="missing-summary">価格未入力 {totals.missingCount}冊</p> : null}
        <div><span>税抜小計</span><strong>{formatYen(totals.subtotal)}</strong></div>
        <div><span>消費税</span><strong>{formatYen(totals.tax)}</strong></div>
        <div className="grand-total"><span>税込合計</span><strong>{formatYen(totals.total)}</strong></div>
      </footer>

      {deleted ? (
        <div className="undo-toast" role="status">
          <span>本を削除しました</span>
          <button type="button" onClick={undoRemove}><Undo2 size={16} /> 元に戻す</button>
        </div>
      ) : null}
      {scannerOpen ? (
        <Suspense fallback={<div className="scanner-loading" role="status">カメラを準備しています</div>}>
          <Scanner onClose={() => setScannerOpen(false)} onDetected={detected} />
        </Suspense>
      ) : null}
      {aboutOpen ? <About onClose={() => setAboutOpen(false)} /> : null}
    </div>
  )
}
