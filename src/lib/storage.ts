import type { Book } from "../types";

const STORAGE_KEY = "imaikura:books:v1";

export function loadBooks(): Book[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((book): book is Book => {
      return (
        typeof book === "object" &&
        book !== null &&
        typeof (book as Book).isbn === "string"
      );
    });
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
