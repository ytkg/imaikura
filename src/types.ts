export type BookStatus = "loading" | "ready" | "not-found" | "error";

export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  openBdPrice: number | null;
  price: number | null;
  priceEdited: boolean;
  included: boolean;
  status: BookStatus;
  addedAt: number;
}

export interface DeletedBook {
  book: Book;
  index: number;
}

export interface OpenBdBook {
  title: string;
  authors: string[];
  coverUrl: string | null;
  price: number | null;
}
