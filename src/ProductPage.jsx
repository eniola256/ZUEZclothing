import { useEffect, useMemo, useState } from "react";
import "./ProductPage.css";
import { CATEGORIES } from "./products.js";
import { useProducts } from "./productsState.js";
import { useCurrency } from "./currencyState.js";
import { MAX_QTY, useCart } from "./cartState.js";
import { productHref } from "./useRoute.js";

// How the colours / styles change on the gallery:
//   "fade"  = they fade into each other
//   "slide" = they slide across
const GALLERY_MODE = "fade";

// Shows a small Fade / Slide switch under the gallery so you can compare
// the two. Set to false when you've decided.
const SHOW_MODE_SWITCH = true;

// Time between automatic changes, in milliseconds
const AUTOPLAY_MS = 3500;

function ProductPage({ id, onBack }) {
  const { status, products, error, retry } = useProducts();
  const product = products.find((p) => p.id === id);

  if (status === "loading") {
    return (
      <main className="pdp">
        <p className="status-msg" role="status">
          Loading…
        </p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="pdp">
        <div className="status-msg" role="alert">
          <p>{error}</p>
          <button type="button" className="status-retry" onClick={retry}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!product || product.variants.length === 0) {
    return (
      <main className="pdp">
        <p className="kicker">Not found</p>
        <h1 className="pdp-title">That piece isn&apos;t in the issue.</h1>
        <a
          className="pdp-back"
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          ← Back to the collection
        </a>
      </main>
    );
  }

  // key resets all the state when you move between two products
  return <ProductView key={product.id} product={product} onBack={onBack} />;
}

function ProductView({ product, onBack }) {
  const variants = product.variants;
  const sizes = product.sizes;

  const { add, openCart } = useCart();
  const { products } = useProducts();
  const { money, priceOf } = useCurrency();

  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false); // true once the customer picks a style
  const [paused, setPaused] = useState(false); // true while hovering the gallery
  const [mode, setMode] = useState(GALLERY_MODE);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const reduceMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Cycle through the styles until the customer picks one
  useEffect(() => {
    if (variants.length < 2 || locked || paused || reduceMotion) return;

    const timer = setInterval(
      () => setIndex((i) => (i + 1) % variants.length),
      AUTOPLAY_MS
    );

    return () => clearInterval(timer);
  }, [variants.length, locked, paused, reduceMotion]);

  // sold out depends on the style you're looking at
  const isOut = (s) => (variants[index].stock[s] ?? 0) <= 0;
  const chosen = size && !isOut(size) ? size : "";

  const pickVariant = (i) => {
    setIndex(i);
    setLocked(true);
  };

  const handleAdd = () => {
    if (sizes.length > 0 && !chosen) {
      setError(
        size ? "That size is sold out in this style." : "Please choose a size."
      );
      return;
    }

    setLocked(true);
    add({
      variantId: variants[index].id,
      size: sizes.length > 0 ? chosen : "",
      qty,
    });
    openCart();
  };

  const categoryLabel = CATEGORIES.find((c) => c.id === product.cat)?.label;

  // a few other pieces to browse underneath
  const position = products.findIndex((p) => p.id === product.id);
  const related = [
    ...products.slice(position + 1),
    ...products.slice(0, position),
  ].slice(0, 4);

  return (
    <main className="pdp">
      <a
        className="pdp-back"
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
      >
        ← The collection
      </a>

      <div className="pdp-grid">
        {/* ───────── GALLERY ───────── */}
        <div
          className={`gallery gallery--${mode}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="gallery-stage" style={{ "--i": index }}>
            <div className="gallery-track">
              {variants.map((v, i) => (
                <img
                  key={v.id}
                  className={`slide ${i === index ? "is-active" : ""}`}
                  src={v.img}
                  alt={i === index ? `${product.name}, ${v.label}` : ""}
                  aria-hidden={i !== index}
                />
              ))}
            </div>
          </div>

          {SHOW_MODE_SWITCH && variants.length > 1 && (
            <div className="gallery-mode" role="group" aria-label="Preview animation">
              <span>Preview</span>
              {["fade", "slide"].map((m) => (
                <button
                  type="button"
                  key={m}
                  aria-pressed={mode === m}
                  className={mode === m ? "active" : ""}
                  onClick={() => setMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ───────── DETAILS ───────── */}
        <div className="pdp-info">
          <span className="kicker">
            {product.isNew ? "New · " : ""}
            {categoryLabel}
          </span>

          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-price">{money(priceOf(product))}</p>
          <p className="pdp-desc">{product.description}</p>

          {variants.length > 1 && (
            <fieldset className="pdp-field">
              <legend>
                Style <span>{variants[index].label}</span>
              </legend>

              <div className="swatches">
                {variants.map((v, i) => (
                  <button
                    type="button"
                    key={v.id}
                    className={`swatch ${v.color ? "swatch--color" : "swatch--text"} ${
                      i === index ? "is-selected" : ""
                    }`}
                    aria-pressed={i === index}
                    aria-label={v.label}
                    onClick={() => pickVariant(i)}
                  >
                    {v.color ? (
                      <span className="swatch-dot" style={{ background: v.color }} />
                    ) : (
                      v.label
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {sizes.length > 0 ? (
            <fieldset className="pdp-field">
              <legend>Size</legend>

              <div className="sizes">
                {sizes.map((s) => {
                  const out = isOut(s);

                  return (
                    <label
                      key={s}
                      className={`size ${chosen === s ? "is-selected" : ""} ${
                        out ? "is-out" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={s}
                        checked={chosen === s}
                        disabled={out}
                        onChange={() => {
                          setSize(s);
                          setLocked(true); // stop the auto-cycling once they're choosing
                          setError("");
                        }}
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="pdp-onesize">One size</p>
          )}

          {error && (
            <p className="pdp-error" role="alert">
              {error}
            </p>
          )}

          <div className="pdp-field">
            <span className="pdp-legend">Amount</span>

            <div className="qty" role="group" aria-label="Amount">
              <button
                type="button"
                aria-label="Decrease amount"
                disabled={qty <= 1}
                onClick={() => setQty((q) => q - 1)}
              >
                −
              </button>
              <output aria-live="polite">{qty}</output>
              <button
                type="button"
                aria-label="Increase amount"
                disabled={qty >= MAX_QTY}
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button type="button" className="pdp-add" onClick={handleAdd}>
            Add to bag · {money(priceOf(product) * qty)}
          </button>
        </div>
      </div>

      {/* ───────── MORE ───────── */}
      <section className="related" aria-labelledby="related-title">
        <h2 className="kicker" id="related-title">
          More from the issue
        </h2>

        <div className="related-grid">
          {related.map((p) => (
            <a className="related-card" href={productHref(p.id)} key={p.id}>
              <div className="related-img">
                <img src={p.img} alt="" />
              </div>
              <div className="related-info">
                <span className="related-name">{p.name}</span>
                <span>{money(priceOf(p))}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductPage;
