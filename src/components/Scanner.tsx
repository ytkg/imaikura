import { useRef, useState } from "react";
import { Keyboard, Lightbulb, LightbulbOff, X } from "lucide-react";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { normalizeIsbn } from "../lib/isbn";

interface ScannerProps {
  onClose: () => void;
  onDetected: (isbn: string) => boolean;
}

export function Scanner({ onClose, onDetected }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState("");
  const { message, cameraError, torchSupported, torchOn, toggleTorch } =
    useBarcodeScanner({
      videoRef,
      active: !manual,
      onDetected,
    });

  const submitManual = (event: React.FormEvent) => {
    event.preventDefault();
    const isbn = normalizeIsbn(manualValue);
    if (!isbn) {
      setManualError("有効なISBNを入力してください");
      return;
    }
    onDetected(isbn);
    onClose();
  };

  return (
    <div
      className="scanner"
      role="dialog"
      aria-modal="true"
      aria-label="本をスキャン"
    >
      <header className="scanner-header">
        <button
          className="scanner-icon-button"
          type="button"
          aria-label="スキャンを閉じる"
          onClick={onClose}
        >
          <X />
        </button>
        <strong>{manual ? "ISBNを入力" : "本をスキャン"}</strong>
        <span className="scanner-header-spacer" />
      </header>

      {manual ? (
        <form className="manual-panel" onSubmit={submitManual}>
          <div>
            <label htmlFor="isbn-input">ISBN</label>
            <input
              id="isbn-input"
              autoFocus
              inputMode="numeric"
              value={manualValue}
              onChange={(event) => {
                setManualValue(event.target.value);
                setManualError("");
              }}
              placeholder="978-4-..."
            />
            {manualError ? (
              <p className="form-error">{manualError}</p>
            ) : (
              <p>ハイフンありのISBN-10・ISBN-13にも対応</p>
            )}
          </div>
          <button className="scanner-primary-button" type="submit">
            追加する
          </button>
          <button
            className="scanner-text-button"
            type="button"
            onClick={() => setManual(false)}
          >
            カメラに戻る
          </button>
        </form>
      ) : (
        <>
          <div className="camera-stage">
            <video ref={videoRef} muted playsInline />
            <div className="scan-frame" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p
              className={`scan-message ${cameraError ? "scan-message--error" : ""}`}
              aria-live="polite"
            >
              {message}
            </p>
            {torchSupported ? (
              <button
                className="torch-button"
                type="button"
                onClick={toggleTorch}
                aria-label={torchOn ? "ライトを消す" : "ライトをつける"}
              >
                {torchOn ? <LightbulbOff /> : <Lightbulb />}
              </button>
            ) : null}
          </div>
          <div className="scanner-footer">
            <button
              className="scanner-secondary-button"
              type="button"
              onClick={() => setManual(true)}
            >
              <Keyboard size={19} /> ISBNを入力
            </button>
          </div>
        </>
      )}
    </div>
  );
}
