import type { Book } from "../types";

export const TAX_RATE = 0.1;

export interface PurchaseTotals {
  subtotal: number;
  tax: number;
  total: number;
  missingCount: number;
}

export function calculateTotals(books: Book[]): PurchaseTotals {
  const included = books.filter((book) => book.included);
  const subtotal = included.reduce(
    (total, book) => total + (book.price ?? 0),
    0,
  );
  const tax = Math.floor(subtotal * TAX_RATE);
  return {
    subtotal,
    tax,
    total: subtotal + tax,
    missingCount: included.filter((book) => book.price === null).length,
  };
}

export function formatYen(value: number): string {
  return `${new Intl.NumberFormat("ja-JP").format(value)}円`;
}
