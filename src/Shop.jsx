import { useEffect, useRef } from "react";
import "./Shop.css";
import { CATEGORIES, PRODUCTS, matchesFilter } from "./products.js";

const pad = (n) => String(n).padStart(2, "0");

function Shop({ filter, onFilter }) {
  const shopRef = useRef(null);

  const visible = PRODUCTS.filter((p) => matchesFilter(p, filter));
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
  }, [filter]);

  const renderProduct = (product, index) => (
    <div
      className={`product p-${product.id}`}
      key={product.id}
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
        <span className="product-name">
          <span className="product-no">No. {pad(product.id)}</span>
          {" — "}
          {product.name}
        </span>
        <span className="product-price">{product.price}</span>
      </div>
    </div>
  );

  return (
    <>
      <section className="shop" id="shop" ref={shopRef}>
        <div className="shop-head">
          <h2 className="shop-title">{title}</h2>
          <span className="shop-count">{pad(visible.length)} pieces</span>
        </div>

        <div className={`shop-grid ${isCollage ? "is-collage" : "is-list"}`}>
          {visible.flatMap((product, index) => {
            const item = renderProduct(product, index);

            // pull quote sits in the collage after the 4th piece
            if (isCollage && product.id === 4) {
              return [
                item,
                <blockquote className="shop-quote" key="quote">
                  Every storm starts quiet.
                </blockquote>,
              ];
            }

            return [item];
          })}
        </div>
      </section>

      <section className="index" aria-labelledby="index-title">
        <h2 className="kicker" id="index-title">
          The index
        </h2>

        <div className="index-list">
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => {
            const count = PRODUCTS.filter((p) => matchesFilter(p, c.id)).length;

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
