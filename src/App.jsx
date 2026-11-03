import { useState, useCallback, useEffect, useRef } from "react";

import NavBar from "./NavBar.jsx";
import Hero from "./Hero.jsx";
import Shop from "./Shop.jsx";
import Footer from "./Footer.jsx";
import Loader from "./Loader.jsx";
import ProductPage from "./ProductPage.jsx";
import CartDrawer from "./CartDrawer.jsx";
import CheckoutPage from "./CheckoutPage.jsx";
import { CartProvider } from "./CartContext.jsx";
import { ProductsProvider } from "./ProductsContext.jsx";
import { CurrencyProvider } from "./CurrencyContext.jsx";
import { useRoute } from "./useRoute.js";

const jumpTo = (top) => window.scrollTo({ top, left: 0, behavior: "instant" });

const scrollToShop = () =>
  document
    .getElementById("shop")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

function Site() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const route = useRoute();
  const pendingShopScroll = useRef(false);
  const homeScrollY = useRef(0);

  const handleLoaded = useCallback(() => setLoading(false), []);

  // Go to the shop grid, from wherever we are
  const goToShop = useCallback(() => {
    if (!["", "#", "#/"].includes(window.location.hash)) {
      pendingShopScroll.current = true;
      window.location.hash = "#/";
    } else {
      requestAnimationFrame(scrollToShop);
    }
  }, []);

  const handleFilter = useCallback(
    (id) => {
      setFilter(id);
      goToShop();
    },
    [goToShop]
  );

  // We restore scroll ourselves (below), so the browser shouldn't also try
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Remember where you were on the home page, so Back puts you there again
  useEffect(() => {
    if (route.name !== "home") return;

    const onScroll = () => {
      // ignore the scroll event the browser fires when the page swaps
      // to a shorter product page (the shop grid is gone by then)
      if (document.getElementById("shop")) {
        homeScrollY.current = window.scrollY;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [route]);

  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (route.name !== "home") jumpTo(0);
      return;
    }

    if (route.name !== "home") {
      jumpTo(0);
    } else if (pendingShopScroll.current) {
      pendingShopScroll.current = false;
      requestAnimationFrame(() => requestAnimationFrame(scrollToShop));
    } else {
      requestAnimationFrame(() => jumpTo(homeScrollY.current));
    }
  }, [route]);

  return (
    <>
      {loading && <Loader onComplete={handleLoaded} />}

      <NavBar filter={filter} onFilter={handleFilter} />

      {route.name === "product" ? (
        <ProductPage id={route.id} onBack={goToShop} />
      ) : route.name === "checkout" ? (
        <CheckoutPage onBack={goToShop} />
      ) : (
        <>
          <Hero isLoading={loading} />
          <Shop filter={filter} onFilter={handleFilter} />
        </>
      )}

      <Footer />

      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <ProductsProvider>
      <CurrencyProvider>
        <CartProvider>
          <Site />
        </CartProvider>
      </CurrencyProvider>
    </ProductsProvider>
  );
}

export default App;
