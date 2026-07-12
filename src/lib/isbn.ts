const digitsOnly = (value: string) => value.replace(/[\s-]/g, "").toUpperCase();

export function isValidIsbn13(value: string): boolean {
  const isbn = digitsOnly(value);
  if (!/^97[89]\d{10}$/.test(isbn)) return false;

  const sum = isbn
    .slice(0, 12)
    .split("")
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (index % 2 === 0 ? 1 : 3),
      0,
    );
  return (10 - (sum % 10)) % 10 === Number(isbn[12]);
}

export function isValidIsbn10(value: string): boolean {
  const isbn = digitsOnly(value);
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const sum = isbn.split("").reduce((total, digit, index) => {
    const number = digit === "X" ? 10 : Number(digit);
    return total + number * (10 - index);
  }, 0);
  return sum % 11 === 0;
}

export function isbn10To13(value: string): string {
  const core = `978${digitsOnly(value).slice(0, 9)}`;
  const sum = core
    .split("")
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (index % 2 === 0 ? 1 : 3),
      0,
    );
  return `${core}${(10 - (sum % 10)) % 10}`;
}

export function normalizeIsbn(value: string): string | null {
  const cleaned = digitsOnly(value);
  if (isValidIsbn13(cleaned)) return cleaned;
  if (isValidIsbn10(cleaned)) return isbn10To13(cleaned);
  return null;
}
