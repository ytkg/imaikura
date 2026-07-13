import { useState } from "react";
import { BookOpen, CircleAlert, RefreshCw } from "lucide-react";
import { formatYen } from "../lib/money";
import type { Book } from "../types";
import { BookEditorDialog } from "./BookEditorDialog";

interface BookCardProps {
  book: Book;
  onUpdate: (update: Partial<Book>) => void;
  onRemove: () => void;
  onRetry: () => void;
}

export function BookCard({ book, onUpdate, onRemove, onRetry }: BookCardProps) {
  const [editing, setEditing] = useState(false);
  const toggleLabel = book.included ? "保留にする" : "購入予定に戻す";

  return (
    <article className={`book-card ${book.included ? "" : "book-card--held"}`}>
      <div className="book-cover" aria-hidden="true">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt="" />
        ) : (
          <BookOpen size={24} />
        )}
      </div>

      <div className="book-details">
        {book.status === "loading" ? (
          <div className="book-loading">
            <span className="spinner" /> 書籍情報を取得中
          </div>
        ) : (
          <>
            <h3>{book.title || "タイトル未入力"}</h3>
            {book.authors.length > 0 ? (
              <p className="book-authors">{book.authors.join("、")}</p>
            ) : null}
          </>
        )}
        <p className="book-isbn">ISBN {book.isbn}</p>

        {book.status === "error" ? (
          <button
            className="inline-action error-text"
            type="button"
            onClick={onRetry}
          >
            <RefreshCw size={14} /> 通信エラー・再試行
          </button>
        ) : null}
        {book.status === "not-found" ? (
          <p className="warning-text">
            <CircleAlert size={14} /> OpenBDに未収録
          </p>
        ) : null}

        <div className="price-row">
          {book.price === null ? (
            <span className="price-missing">価格入力が必要</span>
          ) : (
            <strong>税抜 {formatYen(book.price)}</strong>
          )}
          {book.priceEdited ? (
            <span className="edited-badge">変更済み</span>
          ) : null}
        </div>
      </div>

      <div className="book-actions">
        <button
          className={`action-button include-control ${book.included ? "" : "include-control--held"}`}
          type="button"
          aria-label={`${book.title || book.isbn}を${toggleLabel}`}
          onClick={() => onUpdate({ included: !book.included })}
        >
          {toggleLabel}
        </button>
        <button
          className="action-button"
          type="button"
          aria-label="書籍情報と価格を編集"
          onClick={() => setEditing(true)}
        >
          編集
        </button>
        <button
          className="action-button action-button--danger"
          type="button"
          aria-label="この本を削除"
          onClick={onRemove}
        >
          削除
        </button>
      </div>

      {editing ? (
        <BookEditorDialog
          book={book}
          onClose={() => setEditing(false)}
          onSave={onUpdate}
        />
      ) : null}
    </article>
  );
}
