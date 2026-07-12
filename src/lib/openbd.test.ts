import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOpenBdBook } from "./openbd";

afterEach(() => vi.restoreAllMocks());

describe("fetchOpenBdBook", () => {
  it("maps OpenBD summary fields and the tax-exclusive price", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            summary: {
              title: "テストの本",
              author: "著者A／著者B",
              cover: "https://example.com/cover.jpg",
            },
            onix: {
              ProductSupply: {
                SupplyDetail: {
                  Price: [{ PriceTypeCode: "03", PriceAmount: "1800" }],
                },
              },
            },
          },
        ]),
      ),
    );

    await expect(fetchOpenBdBook("9784101010014")).resolves.toEqual({
      title: "テストの本",
      authors: ["著者A", "著者B"],
      coverUrl: "https://example.com/cover.jpg",
      price: 1800,
    });
  });

  it("returns null when OpenBD has no matching record", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("[null]"));
    await expect(fetchOpenBdBook("9784101010014")).resolves.toBeNull();
  });

  it("keeps a record usable when price and cover are missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            summary: { title: "価格なし", author: "" },
            onix: {},
          },
        ]),
      ),
    );
    await expect(fetchOpenBdBook("9784101010014")).resolves.toEqual({
      title: "価格なし",
      authors: [],
      coverUrl: null,
      price: null,
    });
  });

  it("throws for an unsuccessful API response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 503 }),
    );
    await expect(fetchOpenBdBook("9784101010014")).rejects.toThrow("503");
  });
});
