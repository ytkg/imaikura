import { useState } from "react";
import {
  BookOpen,
  Check,
  CircleAlert,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
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

  return (
    <article className={`book-card ${book.included ? "" : "book-card--held"}`}>
      <button
        className={`include-control ${book.included ? "include-control--active" : ""}`}
        type="button"
        aria-label={
          book.included
            ? `${book.title || book.isbn}を保留にする`
            : `${book.title || book.isbn}を合計に含める`
        }
        onClick={() => onUpdate({ included: !book.included })}
      >
        {book.included ? <Check size={17} strokeWidth={3} /> : null}
      </button>

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
          className="icon-button"
          type="button"
          aria-label="書籍情報と価格を編集"
          title="編集"
          onClick={() => setEditing(true)}
        >
          <Pencil size={18} />
        </button>
        <button
          className="icon-button icon-button--danger"
          type="button"
          aria-label="この本を削除"
          title="削除"
          onClick={onRemove}
        >
          <Trash2 size={18} />
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
