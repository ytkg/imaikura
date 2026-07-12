import { useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { formatYen } from "../lib/money";
import type { Book } from "../types";

interface BookEditorDialogProps {
  book: Book;
  onClose: () => void;
  onSave: (update: Partial<Book>) => void;
}

function toPriceInput(price: number | null): string {
  return price?.toString() ?? "";
}

export function BookEditorDialog({
  book,
  onClose,
  onSave,
}: BookEditorDialogProps) {
  const [title, setTitle] = useState(book.title);
  const [priceInput, setPriceInput] = useState(toPriceInput(book.price));

  const saveChanges = () => {
    const price = priceInput === "" ? null : Number(priceInput);

    onSave({
      title: title.trim(),
      price,
      priceEdited: price !== book.openBdPrice,
      status: book.status === "not-found" ? "ready" : book.status,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`edit-${book.isbn}`}
      >
        <header className="modal-header">
          <h2 id={`edit-${book.isbn}`}>書籍情報を編集</h2>
          <button
            className="icon-button"
            type="button"
            aria-label="閉じる"
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <label className="field-label">
          タイトル
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="タイトル（任意）"
          />
        </label>

        <label className="field-label">
          税抜価格
          <div className="price-input-wrap">
            <input
              aria-label="税抜価格"
              inputMode="numeric"
              pattern="[0-9]*"
              value={priceInput}
              onChange={(event) =>
                setPriceInput(event.target.value.replace(/\D/g, ""))
              }
              placeholder="0"
            />
            <span>円</span>
          </div>
        </label>

        {book.openBdPrice !== null && book.priceEdited ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() => setPriceInput(toPriceInput(book.openBdPrice))}
          >
            <RotateCcw size={16} /> 取得価格（{formatYen(book.openBdPrice)}
            ）に戻す
          </button>
        ) : null}
        <button className="primary-button" type="button" onClick={saveChanges}>
          保存する
        </button>
      </section>
    </div>
  );
}
