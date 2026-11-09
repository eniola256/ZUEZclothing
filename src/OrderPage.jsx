import { useEffect, useRef, useState } from "react";
import "./CheckoutPage.css";
import { getOrder } from "./api.js";
import { useCart } from "./cartState.js";
import { useCurrency } from "./currencyState.js";

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000; // stop checking after 3 minutes (the email still comes)

const PAID = ["paid", "shipped", "delivered"];

function OrderPage({ reference, onBack }) {
  const { clear } = useCart();
  const { money } = useCurrency();

  const [order, setOrder] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  const cleared = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const started = Date.now();
    let timer;

    const check = async () => {
      try {
        const data = await getOrder(reference, controller.signal);
        setOrder(data);
        setState("ready");

        if (PAID.includes(data.status)) {
          // payment confirmed: the bag has done its job
          if (!cleared.current) {
            cleared.current = true;
            clear();
          }
          return; // stop checking
        }
        if (data.status !== "pending") return; // failed / expired: nothing more to wait for
      } catch (e) {
        if (e.name === "AbortError") return;
        // order unknown -> stop; a network blip -> just try again
        if (/not found/i.test(e.message)) {
          setState("missing");
          return;
        }
      }

      if (Date.now() - started > GIVE_UP_MS) {
        setWaitedTooLong(true);
        return;
      }
      timer = setTimeout(check, POLL_MS);
    };

    check();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [reference, clear]);

  const back = (
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
  );

  if (state === "loading") {
    return (
      <main className="checkout">
        {back}
        <p className="status-msg" role="status">
          Checking your order…
        </p>
      </main>
    );
  }

  if (state === "missing" || !order) {
    return (
      <main className="checkout">
        {back}
        <h1 className="checkout-title">We can&apos;t find that order.</h1>
        <p className="checkout-hint">Check the reference in your email: {reference}</p>
      </main>
    );
  }

  const paid = PAID.includes(order.status);

  return (
    <main className="checkout">
      {back}
      <p className="kicker">Order {order.ref}</p>

      {paid && (
        <>
          <h1 className="checkout-title">Payment received. Thank you.</h1>
          <div className="checkout-done" role="status">
            <p>
              We&apos;ve emailed your confirmation and delivery details. Keep the
              reference <strong>{order.ref}</strong> if you need to reach us.
            </p>
          </div>
        </>
      )}

      {order.status === "pending" && (
        <>
          <h1 className="checkout-title">
            {waitedTooLong ? "Still waiting on your payment." : "Confirming your payment…"}
          </h1>
          <div className="checkout-done" role="status">
            {waitedTooLong ? (
              <p>
                We haven&apos;t heard back from the payment page yet. If you were
                charged, don&apos;t pay again: your confirmation email will arrive
                shortly. Otherwise you can go back and try again.
              </p>
            ) : (
              <p>This takes a few seconds. Please keep this page open.</p>
            )}
            {waitedTooLong && (
              <p>
                <a href="#/checkout" className="cart-link">
                  Back to checkout
                </a>
              </p>
            )}
          </div>
        </>
      )}

      {(order.status === "failed" || order.status === "expired") && (
        <>
          <h1 className="checkout-title">
            {order.status === "failed" ? "The payment didn't go through." : "This order expired."}
          </h1>
          <div className="checkout-done">
            <p>You haven&apos;t been charged for this order. Your bag is still saved.</p>
            <p>
              <a href="#/checkout" className="cart-link">
                Try again
              </a>
            </p>
          </div>
        </>
      )}

      <section className="checkout-summary" style={{ marginTop: "2.5rem", maxWidth: 560 }}>
        <ul className="summary-lines">
          {order.items.map((i, n) => (
            <li key={n} style={{ gridTemplateColumns: "1fr auto" }}>
              <div>
                {i.name}
                <span>
                  {i.variant}
                  {i.size ? ` · ${i.size}` : " · One size"} · ×{i.qty}
                </span>
              </div>
              <span>{money(i.unitPrice * i.qty, order.currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="summary-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{money(order.subtotal, order.currency)}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{money(order.shippingFee, order.currency)}</dd>
          </div>
          <div className="summary-total">
            <dt>Total ({order.currency})</dt>
            <dd>{money(order.total, order.currency)}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export default OrderPage;
