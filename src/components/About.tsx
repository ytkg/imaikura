import { ExternalLink, X } from "lucide-react";

export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-sheet about-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">このアプリについて</span>
            <h2 id="about-title">いまいくら？</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="閉じる"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <p>
          選んだ本の税抜価格を合計し、消費税10%を最後に一度だけ加えて税込合計を表示します。
        </p>
        <h3>書籍情報</h3>
        <p>
          書誌情報と書影はOpenBD
          APIから取得します。価格が未収録または店頭と異なる場合は編集できます。
        </p>
        <a href="https://openbd.jp/" target="_blank" rel="noreferrer">
          OpenBDを開く <ExternalLink size={14} />
        </a>
        <h3>データとカメラ</h3>
        <p>
          選んだ本はこの端末のブラウザ内に保存され、独自サーバーには送信しません。カメラはスキャン画面を開いている間だけ使用します。
        </p>
        <p className="about-version">Version 0.1.0 · MIT License</p>
      </section>
    </div>
  );
}
