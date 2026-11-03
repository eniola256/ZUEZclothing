// The clothes now live in the database (Neon) and arrive from the backend.
// This file only keeps the menu and the price formatting.

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "unisex", label: "Unisex" },
  { id: "new", label: "New" },
];

export const CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "Naira", locale: "en-NG" },
  { code: "USD", symbol: "$", label: "Dollar", locale: "en-US" },
];

// Prices are whole kobo / cents (₦28,000 = 2800000). Turn them into text.
export function formatPrice(minor, currency) {
  const c = CURRENCIES.find((x) => x.code === currency) ?? CURRENCIES[0];
  const major = minor / 100;

  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);
}

export function matchesFilter(product, filter) {
  if (filter === "all") return true;
  if (filter === "new") return product.isNew;
  return product.cat === filter;
}
