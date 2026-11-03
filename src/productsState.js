import { createContext, useContext } from "react";

export const ProductsContext = createContext(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}
