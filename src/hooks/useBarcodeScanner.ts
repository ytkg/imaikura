import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import { normalizeIsbn } from "../lib/isbn";

const READY_MESSAGE = "バーコードを枠内に合わせてください";
const CAMERA_ERROR_MESSAGE = "カメラを利用できません";
const REPEAT_SCAN_DELAY_MS = 2_500;
const FEEDBACK_DURATION_MS = 1_600;
const VIBRATION_DURATION_MS = 80;

interface UseBarcodeScannerOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  onDetected: (isbn: string) => boolean;
}

interface RecentScan {
  isbn: string;
  scannedAt: number;
}

function isRepeatedScan(
  recentScan: RecentScan | null,
  isbn: string,
  now: number,
): boolean {
  return (
    recentScan?.isbn === isbn &&
    now - recentScan.scannedAt < REPEAT_SCAN_DELAY_MS
  );
}

export function useBarcodeScanner({
  videoRef,
  active,
  onDetected,
}: UseBarcodeScannerOptions) {
  const controlsRef = useRef<IScannerControls | null>(null);
  const recentScanRef = useRef<RecentScan | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const [message, setMessage] = useState(READY_MESSAGE);
  const [cameraError, setCameraError] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const showScanFeedback = useCallback((added: boolean) => {
    setMessage(added ? "追加しました" : "追加済みです");
    if (added && "vibrate" in navigator)
      navigator.vibrate(VIBRATION_DURATION_MS);

    if (feedbackTimerRef.current !== null)
      window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(
      () => setMessage(READY_MESSAGE),
      FEEDBACK_DURATION_MS,
    );
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!active || !videoElement) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 100,
    });

    void reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoElement,
        (result, _error, controls) => {
          controlsRef.current = controls;
          setTorchSupported(typeof controls.switchTorch === "function");
          if (!result || cancelled) return;

          const isbn = normalizeIsbn(result.getText());
          if (!isbn) return;

          const now = Date.now();
          if (isRepeatedScan(recentScanRef.current, isbn, now)) return;
          recentScanRef.current = { isbn, scannedAt: now };
          showScanFeedback(onDetected(isbn));
        },
      )
      .then((controls) => {
        if (cancelled) controls.stop();
        else controlsRef.current = controls;
      })
      .catch(() => {
        if (cancelled) return;
        setCameraError(true);
        setMessage(CAMERA_ERROR_MESSAGE);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onDetected, showScanFeedback, videoRef]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null)
        window.clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  const toggleTorch = useCallback(async () => {
    try {
      await controlsRef.current?.switchTorch?.(!torchOn);
      setTorchOn((current) => !current);
    } catch {
      setTorchSupported(false);
    }
  }, [torchOn]);

  return { message, cameraError, torchSupported, torchOn, toggleTorch };
}
