import { BookOpen, ScanBarcode } from "lucide-react";
import type { Book } from "../types";
import { BookCard } from "./BookCard";

interface BookListProps {
  plannedBooks: Book[];
  heldBooks: Book[];
  onOpenScanner: () => void;
  onUpdateBook: (isbn: string, update: Partial<Book>) => void;
  onRemoveBook: (isbn: string) => void;
  onRetryBook: (isbn: string) => void;
}

interface BookSectionProps {
  id: string;
  title: string;
  books: Book[];
  emptyMessage?: string;
  held?: boolean;
  onUpdateBook: BookListProps["onUpdateBook"];
  onRemoveBook: BookListProps["onRemoveBook"];
  onRetryBook: BookListProps["onRetryBook"];
}

function EmptyBookList({
  onOpenScanner,
}: Pick<BookListProps, "onOpenScanner">) {
  return (
    <section className="empty-state">
      <div className="empty-icon">
        <BookOpen size={34} />
        <span aria-hidden="true" />
      </div>
      <h1>
        選んだ本を
        <br />
        スキャンしよう
      </h1>
      <p>合計金額をその場で確認できます</p>
      <button
        className="primary-button scan-cta"
        type="button"
        onClick={onOpenScanner}
      >
        <ScanBarcode size={20} /> スキャンする
      </button>
    </section>
  );
}

function BookSection({
  id,
  title,
  books,
  emptyMessage,
  held = false,
  onUpdateBook,
  onRemoveBook,
  onRetryBook,
}: BookSectionProps) {
  return (
    <section
      className={`book-section ${held ? "held-section" : ""}`}
      aria-labelledby={id}
    >
      <div className="section-heading">
        <h2 id={id}>{title}</h2>
        <span>{books.length}冊</span>
      </div>
      {books.length === 0 && emptyMessage ? (
        <p className="section-empty">{emptyMessage}</p>
      ) : null}
      {books.map((book) => (
        <BookCard
          key={book.isbn}
          book={book}
          onUpdate={(update) => onUpdateBook(book.isbn, update)}
          onRemove={() => onRemoveBook(book.isbn)}
          onRetry={() => onRetryBook(book.isbn)}
        />
      ))}
    </section>
  );
}

export function BookList({
  plannedBooks,
  heldBooks,
  onOpenScanner,
  onUpdateBook,
  onRemoveBook,
  onRetryBook,
}: BookListProps) {
  const hasBooks = plannedBooks.length > 0 || heldBooks.length > 0;

  if (!hasBooks) {
    return (
      <main className="book-list book-list--empty">
        <EmptyBookList onOpenScanner={onOpenScanner} />
      </main>
    );
  }

  return (
    <main className="book-list">
      <BookSection
        id="planned-heading"
        title="購入予定"
        books={plannedBooks}
        emptyMessage="合計に含める本はありません"
        onUpdateBook={onUpdateBook}
        onRemoveBook={onRemoveBook}
        onRetryBook={onRetryBook}
      />
      {heldBooks.length > 0 ? (
        <BookSection
          id="held-heading"
          title="保留"
          books={heldBooks}
          held
          onUpdateBook={onUpdateBook}
          onRemoveBook={onRemoveBook}
          onRetryBook={onRetryBook}
        />
      ) : null}
    </main>
  );
}
