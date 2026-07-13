import { BookOpen, Info, MoreVertical, Trash2 } from "lucide-react";

interface AppHeaderProps {
  hasBooks: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenAbout: () => void;
  onClearBooks: () => void;
}

export function AppHeader({
  hasBooks,
  menuOpen,
  onToggleMenu,
  onOpenAbout,
  onClearBooks,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="./" aria-label="いまいくら？ ホーム">
        <span className="brand-mark">
          <BookOpen size={21} />
          <i aria-hidden="true" />
        </span>
        <span>いまいくら？</span>
      </a>

      <div className="menu-wrap">
        <button
          className="icon-button"
          type="button"
          aria-label="メニュー"
          onClick={onToggleMenu}
        >
          <MoreVertical />
        </button>
        {menuOpen ? (
          <div className="overflow-menu">
            <button type="button" onClick={onOpenAbout}>
              <Info size={17} /> このアプリについて
            </button>
            <button
              type="button"
              className="danger-text"
              disabled={!hasBooks}
              onClick={onClearBooks}
            >
              <Trash2 size={17} /> すべて削除
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
