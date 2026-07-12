import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchOpenBdBook } from "../lib/openbd";
import { loadBooks, saveBooks } from "../lib/storage";
import type { Book, DeletedBook } from "../types";

type BooksUpdater = (currentBooks: Book[]) => Book[];

function createPendingBook(isbn: string): Book {
  return {
    isbn,
    title: "",
    authors: [],
    coverUrl: null,
    openBdPrice: null,
    price: null,
    priceEdited: false,
    included: true,
    status: "loading",
    addedAt: Date.now(),
  };
}

function updateBookByIsbn(
  books: Book[],
  isbn: string,
  update: Partial<Book>,
): Book[] {
  return books.map((book) =>
    book.isbn === isbn ? { ...book, ...update } : book,
  );
}

function applyLookupResult(
  book: Book,
  result: Awaited<ReturnType<typeof fetchOpenBdBook>>,
): Book {
  if (!result) return { ...book, status: "not-found" };

  return {
    ...book,
    title: result.title,
    authors: result.authors,
    coverUrl: result.coverUrl,
    openBdPrice: result.price,
    price: book.priceEdited ? book.price : result.price,
    status: "ready",
  };
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const booksRef = useRef(books);
  const [deleted, setDeleted] = useState<DeletedBook | null>(null);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  const commitBooks = useCallback((updater: BooksUpdater) => {
    const nextBooks = updater(booksRef.current);
    booksRef.current = nextBooks;
    setBooks(nextBooks);
  }, []);

  const fetchMetadata = useCallback(
    async (isbn: string) => {
      commitBooks((currentBooks) =>
        updateBookByIsbn(currentBooks, isbn, { status: "loading" }),
      );

      try {
        const result = await fetchOpenBdBook(isbn);
        commitBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.isbn === isbn ? applyLookupResult(book, result) : book,
          ),
        );
      } catch {
        commitBooks((currentBooks) =>
          updateBookByIsbn(currentBooks, isbn, { status: "error" }),
        );
      }
    },
    [commitBooks],
  );

  const addBook = useCallback(
    (isbn: string): boolean => {
      if (booksRef.current.some((book) => book.isbn === isbn)) return false;
      commitBooks((currentBooks) => [createPendingBook(isbn), ...currentBooks]);
      void fetchMetadata(isbn);
      return true;
    },
    [commitBooks, fetchMetadata],
  );

  useEffect(() => {
    const retryFailedLookups = () => {
      booksRef.current
        .filter((book) => book.status === "error")
        .forEach((book) => void fetchMetadata(book.isbn));
    };
    window.addEventListener("online", retryFailedLookups);
    return () => window.removeEventListener("online", retryFailedLookups);
  }, [fetchMetadata]);

  const updateBook = useCallback(
    (isbn: string, update: Partial<Book>) => {
      commitBooks((currentBooks) =>
        updateBookByIsbn(currentBooks, isbn, update),
      );
    },
    [commitBooks],
  );

  const removeBook = useCallback(
    (isbn: string) => {
      commitBooks((currentBooks) => {
        const index = currentBooks.findIndex((book) => book.isbn === isbn);
        if (index < 0) return currentBooks;
        setDeleted({ book: currentBooks[index], index });
        return currentBooks.filter((book) => book.isbn !== isbn);
      });
    },
    [commitBooks],
  );

  const undoRemove = useCallback(() => {
    if (!deleted) return;
    commitBooks((currentBooks) => {
      const restoredBooks = [...currentBooks];
      const restoreIndex = Math.min(deleted.index, restoredBooks.length);
      restoredBooks.splice(restoreIndex, 0, deleted.book);
      return restoredBooks;
    });
    setDeleted(null);
  }, [commitBooks, deleted]);

  const plannedBooks = useMemo(
    () => books.filter((book) => book.included),
    [books],
  );
  const heldBooks = useMemo(
    () => books.filter((book) => !book.included),
    [books],
  );
  const clearDeleted = useCallback(() => setDeleted(null), []);
  const clearBooks = useCallback(() => commitBooks(() => []), [commitBooks]);

  return {
    books,
    plannedBooks,
    heldBooks,
    deleted,
    addBook,
    updateBook,
    removeBook,
    undoRemove,
    clearDeleted,
    clearBooks,
    retryBook: fetchMetadata,
  };
}
