import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { CartContext, MAX_QTY } from "./cartState.js";
import { useProducts } from "./productsState.js";
import { useCurrency } from "./currencyState.js";

// v2: lines now point at the database's variant ids
const STORAGE_KEY = "zuez-cart-v2";

const lineKey = (variantId, size) => `${variantId}|${size || "one-size"}`;

const clampQty = (n) => Math.max(1, Math.min(MAX_QTY, n));

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data)
      ? data.filter((l) => Number.isInteger(l?.variantId) && l.qty > 0)
      : [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const { variantId, size, qty } = action;
      const key = lineKey(variantId, size);
      const existing = state.find((l) => l.key === key);

      if (existing) {
        return state.map((l) =>
          l.key === key ? { ...l, qty: clampQty(l.qty + qty) } : l
        );
      }

      return [...state, { key, variantId, size, qty: clampQty(qty) }];
    }
    case "qty":
      return state.map((l) =>
        l.key === action.key ? { ...l, qty: clampQty(action.qty) } : l
      );
    case "remove":
      return state.filter((l) => l.key !== action.key);
    case "prune": {
      // drop lines for clothes that no longer exist
      const next = state.filter((l) => action.valid.has(l.variantId));
      return next.length === state.length ? state : next;
    }
    case "clear":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);
  const { status, products } = useProducts();
  const { currency } = useCurrency();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode or storage full: the bag still works for this visit */
    }
  }, [lines]);

  // variant id -> { product, variant }
  const index = useMemo(() => {
    const map = new Map();
    for (const product of products) {
      for (const variant of product.variants) map.set(variant.id, { product, variant });
    }
    return map;
  }, [products]);

  // once the clothes have loaded, forget anything that was removed from the shop
  useEffect(() => {
    if (status === "ready") {
      dispatch({ type: "prune", valid: new Set(index.keys()) });
    }
  }, [status, index]);

  const detailed = useMemo(
    () =>
      lines
        .filter((l) => index.has(l.variantId))
        .map((line) => {
          const { product, variant } = index.get(line.variantId);
          return {
            ...line,
            product,
            variant,
            unitPrice: product.prices[currency],
            total: product.prices[currency] * line.qty,
          };
        }),
    [lines, index, currency]
  );

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = detailed.reduce((n, l) => n + l.total, 0);

  const add = useCallback((item) => dispatch({ type: "add", ...item }), []);
  const setQty = useCallback((key, qty) => dispatch({ type: "qty", key, qty }), []);
  const remove = useCallback((key) => dispatch({ type: "remove", key }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = {
    lines: detailed,
    count,
    subtotal,
    open,
    openCart,
    closeCart,
    add,
    setQty,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
