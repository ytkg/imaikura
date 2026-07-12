import { formatYen, type PurchaseTotals } from "../lib/money";

export function TotalsBar({ totals }: { totals: PurchaseTotals }) {
  return (
    <footer className="totals" aria-label="合計金額">
      {totals.missingCount > 0 ? (
        <p className="missing-summary">価格未入力 {totals.missingCount}冊</p>
      ) : null}
      <div>
        <span>税抜小計</span>
        <strong>{formatYen(totals.subtotal)}</strong>
      </div>
      <div>
        <span>消費税</span>
        <strong>{formatYen(totals.tax)}</strong>
      </div>
      <div className="grand-total">
        <span>税込合計</span>
        <strong>{formatYen(totals.total)}</strong>
      </div>
    </footer>
  );
}
