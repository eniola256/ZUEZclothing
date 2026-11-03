import { useEffect, useState } from "react";

// Tiny hash router, so there is nothing extra to install or configure on Vercel.
//   #/                    -> home
//   #/product/<slug>      -> product page
//   #/checkout            -> checkout
const PRODUCT_ROUTE = /^#\/product\/([a-z0-9-]+)\/?$/;
const CHECKOUT_ROUTE = /^#\/checkout\/?$/;

function parse() {
  const hash = window.location.hash;
  const product = PRODUCT_ROUTE.exec(hash);
  if (product) return { name: "product", id: product[1] };
  if (CHECKOUT_ROUTE.test(hash)) return { name: "checkout" };
  return { name: "home" };
}

export function useRoute() {
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export const productHref = (slug) => `#/product/${slug}`;
export const CHECKOUT_HREF = "#/checkout";
