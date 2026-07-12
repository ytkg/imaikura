import type { OpenBdBook } from "../types";

const API_URL = "https://api.openbd.jp/v1/get";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object"
    ? (value as UnknownRecord)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function parsePrice(record: UnknownRecord): number | null {
  const onix = asRecord(record.onix);
  const productSupply = asRecord(onix.ProductSupply);
  const details = asArray(productSupply.SupplyDetail);

  for (const detailValue of details) {
    const detail = asRecord(detailValue);
    for (const priceValue of asArray(detail.Price)) {
      const price = asRecord(priceValue);
      const amount = Number(price.PriceAmount);
      if (Number.isInteger(amount) && amount >= 0) return amount;
    }
  }

  return null;
}

export async function fetchOpenBdBook(
  isbn: string,
  signal?: AbortSignal,
): Promise<OpenBdBook | null> {
  const response = await fetch(`${API_URL}?isbn=${encodeURIComponent(isbn)}`, {
    signal,
  });
  if (!response.ok)
    throw new Error(`OpenBD request failed: ${response.status}`);

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload[0] == null) return null;

  const record = asRecord(payload[0]);
  const summary = asRecord(record.summary);
  const author =
    typeof summary.author === "string" ? summary.author.trim() : "";

  return {
    title: typeof summary.title === "string" ? summary.title : "",
    authors: author ? author.split(/\s*[／/]\s*/).filter(Boolean) : [],
    coverUrl:
      typeof summary.cover === "string" && summary.cover ? summary.cover : null,
    price: parsePrice(record),
  };
}
