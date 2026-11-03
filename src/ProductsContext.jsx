import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts } from "./api.js";
import { ProductsContext } from "./productsState.js";

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const sizeRank = (s) => {
  const i = SIZE_ORDER.indexOf(s);
  return i === -1 ? 99 : i;
};

// Turn what the backend sends into the shape the pages use
function toProduct(row) {
  const variants = row.variants.map((v) => ({
    id: v.id,
    label: v.label,
    color: v.color || undefined,
    img: v.images?.[0] ?? "",
    stock: v.stock ?? {},
  }));

  const sizes = [
    ...new Set(variants.flatMap((v) => Object.keys(v.stock)).filter((s) => s !== "")),
  ].sort((a, b) => sizeRank(a) - sizeRank(b));

  return {
    id: row.slug,
    name: row.name,
    description: row.description,
    cat: row.category,
    isNew: row.is_new,
    prices: { NGN: row.price_ngn, USD: row.price_usd },
    sizes, // [] means one-size
    variants,
    img: variants[0]?.img ?? "",
    hoverImg: variants[1]?.img || variants[0]?.img || "",
  };
}

export function ProductsProvider({ children }) {
  const [state, setState] = useState({ status: "loading", products: [], error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getProducts(controller.signal)
      .then((rows) =>
        setState({ status: "ready", products: rows.map(toProduct), error: "" })
      )
      .catch((e) => {
        if (e.name !== "AbortError") {
          setState({ status: "error", products: [], error: e.message });
        }
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading", products: [], error: "" });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(() => ({ ...state, retry }), [state, retry]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
