import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ScanBarcode } from "lucide-react";
import { About } from "./components/About";
import { AppHeader } from "./components/AppHeader";
import { BookList } from "./components/BookList";
import { TotalsBar } from "./components/TotalsBar";
import { UndoToast } from "./components/UndoToast";
import { useBooks } from "./hooks/useBooks";
import { calculateTotals } from "./lib/money";

const Scanner = lazy(() =>
  import("./components/Scanner").then((module) => ({
    default: module.Scanner,
  })),
);

export default function App() {
  const {
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
    retryBook,
  } = useBooks();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const totals = useMemo(() => calculateTotals(books), [books]);

  const handleIsbnDetected = useCallback(
    (isbn: string) => addBook(isbn),
    [addBook],
  );

  useEffect(() => {
    if (!deleted) return;
    const timeout = window.setTimeout(clearDeleted, 5000);
    return () => window.clearTimeout(timeout);
  }, [deleted, clearDeleted]);

  const clearAllBooks = () => {
    setMenuOpen(false);
    if (window.confirm("購入予定と保留の本をすべて削除しますか？"))
      clearBooks();
  };

  const openAbout = () => {
    setMenuOpen(false);
    setAboutOpen(true);
  };

  return (
    <div className="app-shell">
      <AppHeader
        hasBooks={books.length > 0}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onOpenAbout={openAbout}
        onClearBooks={clearAllBooks}
      />

      <BookList
        plannedBooks={plannedBooks}
        heldBooks={heldBooks}
        onOpenScanner={() => setScannerOpen(true)}
        onUpdateBook={updateBook}
        onRemoveBook={removeBook}
        onRetryBook={(isbn) => void retryBook(isbn)}
      />

      {books.length > 0 ? (
        <button
          className="floating-scan"
          type="button"
          aria-label="本をスキャン"
          title="本をスキャン"
          onClick={() => setScannerOpen(true)}
        >
          <ScanBarcode />
        </button>
      ) : null}

      <TotalsBar totals={totals} />

      {deleted ? <UndoToast onUndo={undoRemove} /> : null}
      {scannerOpen ? (
        <Suspense
          fallback={
            <div className="scanner-loading" role="status">
              カメラを準備しています
            </div>
          }
        >
          <Scanner
            onClose={() => setScannerOpen(false)}
            onDetected={handleIsbnDetected}
          />
        </Suspense>
      ) : null}
      {aboutOpen ? <About onClose={() => setAboutOpen(false)} /> : null}
    </div>
  );
}
