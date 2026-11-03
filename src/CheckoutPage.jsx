import { useEffect, useMemo, useState } from "react";
import "./CheckoutPage.css";
import { createOrder, getZones } from "./api.js";
import { useCart } from "./cartState.js";
import { useCurrency } from "./currencyState.js";
import { productHref } from "./useRoute.js";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
};

function CheckoutPage({ onBack }) {
  const { lines, subtotal, clear, openCart } = useCart();
  const { currency, money } = useCurrency();

  const [zones, setZones] = useState([]);
  const [zonesError, setZonesError] = useState("");
  const [zoneId, setZoneId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getZones(controller.signal)
      .then(setZones)
      .catch((e) => {
        if (e.name !== "AbortError") setZonesError(e.message);
      });

    return () => controller.abort();
  }, []);

  // A zone is only offered when it has a fee in the chosen currency
  const feeOf = (zone) => (currency === "NGN" ? zone.fee_ngn : zone.fee_usd);
  const available = useMemo(
    () => zones.filter((z) => (currency === "NGN" ? z.fee_ngn : z.fee_usd) !== null),
    [zones, currency]
  );

  // keep the selection valid when the currency is switched
  const zone = available.find((z) => z.id === zoneId) ?? available[0] ?? null;
  const shipping = zone ? feeOf(zone) : 0;
  const total = subtotal + shipping;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending || !zone) return;

    setSending(true);
    setError("");

    try {
      const order = await createOrder({
        currency,
        zoneId: zone.id,
        customer: form,
        items: lines.map((l) => ({
          variantId: l.variantId,
          size: l.size,
          qty: l.qty,
        })),
      });

      setPlaced({ ...order, email: form.email });
      clear(); // the order now exists on the server
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

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

  // ───────── after the order is created ─────────
  if (placed) {
    return (
      <main className="checkout">
        {back}
        <p className="kicker">Order {placed.ref}</p>
        <h1 className="checkout-title">Your order is reserved.</h1>

        <div className="checkout-done">
          <p>
            Total <strong>{money(placed.total, placed.currency)}</strong> (delivery{" "}
            {money(placed.shippingFee, placed.currency)} included).
          </p>
          <p>
            We&apos;re holding your pieces for 15 minutes. Details will be sent to{" "}
            <strong>{placed.email}</strong>.
          </p>
          <p className="checkout-hint">
            Payment isn&apos;t connected yet, so nothing has been charged. That&apos;s
            the next step we&apos;re building.
          </p>
        </div>
      </main>
    );
  }

  // ───────── empty bag ─────────
  if (lines.length === 0) {
    return (
      <main className="checkout">
        {back}
        <h1 className="checkout-title">Your bag is empty.</h1>
        <p className="checkout-hint">Add something from the collection first.</p>
      </main>
    );
  }

  return (
    <main className="checkout">
      {back}
      <h1 className="checkout-title">Checkout</h1>

      <form className="checkout-grid" onSubmit={submit}>
        <div className="checkout-fields">
          <fieldset className="checkout-group">
            <legend>Contact</legend>

            <label className="field">
              <span>Full name</span>
              <input required autoComplete="name" value={form.name} onChange={set("name")} />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                />
              </label>

              <label className="field">
                <span>Phone</span>
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="checkout-group">
            <legend>Delivery</legend>

            {zonesError && (
              <p className="checkout-error" role="alert">
                {zonesError}
              </p>
            )}

            <div className="zones" role="radiogroup" aria-label="Delivery area">
              {zones.map((z) => {
                const fee = feeOf(z);
                const off = fee === null;

                return (
                  <label
                    key={z.id}
                    className={`zone ${zone?.id === z.id ? "is-selected" : ""} ${
                      off ? "is-out" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="zone"
                      checked={zone?.id === z.id}
                      disabled={off}
                      onChange={() => setZoneId(z.id)}
                    />
                    <span>{z.name}</span>
                    <span>
                      {off
                        ? `${currency === "NGN" ? "Dollar" : "Naira"} only`
                        : money(fee)}
                    </span>
                  </label>
                );
              })}
            </div>

            <label className="field">
              <span>Street address</span>
              <input
                required
                autoComplete="street-address"
                value={form.address}
                onChange={set("address")}
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>City</span>
                <input
                  required
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={set("city")}
                />
              </label>

              <label className="field">
                <span>State / region</span>
                <input
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={set("state")}
                />
              </label>
            </div>

            <label className="field">
              <span>Country</span>
              <input
                required
                autoComplete="country-name"
                value={form.country}
                onChange={set("country")}
              />
            </label>
          </fieldset>
        </div>

        {/* ───────── summary ───────── */}
        <aside className="checkout-summary" aria-label="Order summary">
          <div className="summary-head">
            <h2 className="kicker">Your order</h2>
            <button type="button" className="cart-link" onClick={openCart}>
              Edit bag
            </button>
          </div>

          <ul className="summary-lines">
            {lines.map((l) => (
              <li key={l.key}>
                <img src={l.variant.img} alt="" />
                <div>
                  <a href={productHref(l.product.id)}>{l.product.name}</a>
                  <span>
                    {l.variant.label}
                    {l.size ? ` · ${l.size}` : " · One size"} · ×{l.qty}
                  </span>
                </div>
                <span>{money(l.total)}</span>
              </li>
            ))}
          </ul>

          <dl className="summary-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{zone ? money(shipping) : "—"}</dd>
            </div>
            <div className="summary-total">
              <dt>Total ({currency})</dt>
              <dd>{money(total)}</dd>
            </div>
          </dl>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="pdp-add" disabled={sending || !zone}>
            {sending ? "Placing order…" : `Place order · ${money(total)}`}
          </button>

          <p className="checkout-hint">
            Prices are checked again on our server. Switch ₦ / $ at the top to pay in
            Naira or Dollars.
          </p>
        </aside>
      </form>
    </main>
  );
}

export default CheckoutPage;
