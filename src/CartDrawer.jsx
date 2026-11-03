import { useEffect, useRef } from "react";
import "./CartDrawer.css";
import { MAX_QTY, useCart } from "./cartState.js";
import { useCurrency } from "./currencyState.js";
import { CHECKOUT_HREF, productHref } from "./useRoute.js";

function CartDrawer() {
  const { lines, count, subtotal, open, closeCart, setQty, remove } = useCart();

  const { money } = useCurrency();
  const closeRef = useRef(null);

  // While open: lock page scroll, move focus in, close on Escape,
  // and give focus back to the Bag button afterwards.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, closeCart]);

  const handleCheckout = () => {
    closeCart();
    window.location.hash = CHECKOUT_HREF;
  };

  return (
    <>
      <div
        className={`cart-overlay ${open ? "is-open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`cart ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        inert={!open}
      >
        <header className="cart-head">
          <h2 className="cart-title">Bag{count > 0 ? ` (${count})` : ""}</h2>

          <button
            type="button"
            className="cart-close"
            ref={closeRef}
            onClick={closeCart}
          >
            Close
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-title">Your bag is empty.</p>
            <button type="button" className="cart-link" onClick={closeCart}>
              Keep shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((line) => (
                <li className="cart-line" key={line.key}>
                  <a
                    className="cart-thumb"
                    href={productHref(line.product.id)}
                    onClick={closeCart}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img src={line.variant.img} alt="" />
                  </a>

                  <div className="cart-line-info">
                    <a
                      className="cart-line-name"
                      href={productHref(line.product.id)}
                      onClick={closeCart}
                    >
                      {line.product.name}
                    </a>

                    <span className="cart-line-meta">
                      {line.variant.label}
                      {line.size ? ` · ${line.size}` : " · One size"}
                    </span>

                    <div className="cart-line-controls">
                      <div className="cart-qty" role="group" aria-label="Amount">
                        <button
                          type="button"
                          aria-label={`Decrease amount of ${line.product.name}`}
                          disabled={line.qty <= 1}
                          onClick={() => setQty(line.key, line.qty - 1)}
                        >
                          −
                        </button>
                        <output>{line.qty}</output>
                        <button
                          type="button"
                          aria-label={`Increase amount of ${line.product.name}`}
                          disabled={line.qty >= MAX_QTY}
                          onClick={() => setQty(line.key, line.qty + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => remove(line.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <span className="cart-line-price">
                    {money(line.total)}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="cart-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>

              <p className="cart-note">Shipping is calculated at checkout.</p>

              <button
                type="button"
                className="cart-checkout"
                onClick={handleCheckout}
              >
                Checkout
              </button>

            </footer>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
