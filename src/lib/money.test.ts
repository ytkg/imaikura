import { describe, expect, it } from "vitest";
import { calculateTotals } from "./money";
import type { Book } from "../types";

const book = (price: number | null, included = true): Book => ({
  isbn: String(Math.random()),
  title: "",
  authors: [],
  coverUrl: null,
  openBdPrice: price,
  price,
  priceEdited: false,
  included,
  status: "ready",
  addedAt: 0,
});

describe("calculateTotals", () => {
  it("calculates tax once from the included subtotal and floors fractions", () => {
    expect(calculateTotals([book(999), book(1001), book(400, false)])).toEqual({
      subtotal: 2000,
      tax: 200,
      total: 2200,
      missingCount: 0,
    });
  });

  it("counts included books with missing prices without adding them", () => {
    expect(calculateTotals([book(101), book(null), book(null, false)])).toEqual(
      {
        subtotal: 101,
        tax: 10,
        total: 111,
        missingCount: 1,
      },
    );
  });
});
