import { useEffect, useState } from "react";

// Tiny hash router, so there is nothing extra to install or configure on Vercel.
//   #/                    -> home
//   #/product/<slug>      -> product page
//   #/checkout            -> checkout
//   #/admin               -> owner admin (password protected)
//   #/order/<ref>         -> "did my payment go through?" page
const PRODUCT_ROUTE = /^#\/product\/([a-z0-9-]+)\/?$/;
const ADMIN_ROUTE = /^#\/admin\/?$/;
const CHECKOUT_ROUTE = /^#\/checkout\/?$/;
// Bachs adds ?checkout_id=... to the return address, so allow a query on the end
const ORDER_ROUTE = /^#\/order\/([A-Za-z0-9-]+)\/?(\?.*)?$/;

function parse() {
  const hash = window.location.hash;
  const product = PRODUCT_ROUTE.exec(hash);
  if (product) return { name: "product", id: product[1] };
  if (CHECKOUT_ROUTE.test(hash)) return { name: "checkout" };
  if (ADMIN_ROUTE.test(hash)) return { name: "admin" };
  const order = ORDER_ROUTE.exec(hash);
  if (order) return { name: "order", ref: order[1].toUpperCase() };
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
