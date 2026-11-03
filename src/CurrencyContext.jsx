import { useCallback, useMemo, useState } from "react";
import { CURRENCIES, formatPrice } from "./products.js";
import { CurrencyContext } from "./currencyState.js";

const STORAGE_KEY = "zuez-currency";

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (CURRENCIES.some((c) => c.code === saved)) return saved;
  } catch {
    /* storage blocked: fall through to the default */
  }
  return "NGN";
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(load);

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* fine: it just won't be remembered next visit */
    }
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      // money(2800000) -> "₦28,000" or "$28" depending on the customer's choice
      money: (minor, code = currency) => formatPrice(minor, code),
      // the price of a product in the chosen currency (in kobo / cents)
      priceOf: (product) => product.prices[currency],
    }),
    [currency, setCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
