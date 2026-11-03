import { useEffect, useRef } from "react";
import "./Shop.css";
import { CATEGORIES, matchesFilter } from "./products.js";
import { useProducts } from "./productsState.js";
import { useCurrency } from "./currencyState.js";
import { productHref } from "./useRoute.js";

const pad = (n) => String(n).padStart(2, "0");

function Shop({ filter, onFilter }) {
  const shopRef = useRef(null);
  const { status, products, error, retry } = useProducts();
  const { money, priceOf } = useCurrency();

  const visible = products.filter((p) => matchesFilter(p, filter));
  const isCollage = filter === "all";
  const title =
    filter === "all"
      ? "The collection"
      : CATEGORIES.find((c) => c.id === filter)?.label;

  // Reveal images as they scroll into view (re-runs when the filter changes)
  useEffect(() => {
    const shop = shopRef.current;
    if (!shop) return;

    const images = shop.querySelectorAll(".product-image:not(.in-view)");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    images.forEach((image) => observer.observe(image));

    return () => observer.disconnect();
  }, [filter, status]);

  const renderProduct = (product, index) => (
    <a
      className={`product p-${index + 1}`}
      key={product.id}
      href={productHref(product.id)}
      style={{ "--delay": `${(index % 3) * 0.12}s` }}
    >
      <div className="product-image">
        <img className="img-bg" src={product.img} alt={product.name} />

        <img
          className="img-hover"
          src={product.hoverImg}
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="product-info">
        <span className="product-name">{product.name}</span>
        <span className="product-price">{money(priceOf(product))}</span>
      </div>
    </a>
  );

  return (
    <>
      <section className="shop" id="shop" ref={shopRef}>
        <div className="shop-head">
          <h2 className="shop-title">{title}</h2>
          {status === "ready" && (
            <span className="shop-count">{pad(visible.length)} pieces</span>
          )}
        </div>

        {status === "loading" && (
          <p className="status-msg" role="status">
            Loading the collection… the first visit can take a few seconds.
          </p>
        )}

        {status === "error" && (
          <div className="status-msg" role="alert">
            <p>{error}</p>
            <button type="button" className="status-retry" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <p className="status-msg">Nothing here yet.</p>
        )}

        {status === "ready" && (
          <div className={`shop-grid ${isCollage ? "is-collage" : "is-list"}`}>
            {visible.map(renderProduct)}
          </div>
        )}
      </section>

      <section className="index" aria-labelledby="index-title">
        <h2 className="kicker" id="index-title">
          The index
        </h2>

        <div className="index-list">
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => {
            const count = products.filter((p) => matchesFilter(p, c.id)).length;

            return (
              <button
                type="button"
                className="index-row"
                key={c.id}
                onClick={() => onFilter(c.id)}
              >
                <span className="index-name">{c.label}</span>
                <span className="index-count">{pad(count)} pieces →</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default Shop;
