import { useCallback, useEffect, useState } from "react";
import { AuthError, getOrder, listOrders, resolveOrder, setOrderStatus } from "./adminApi.js";
import { formatPrice } from "./products.js";

const FILTERS = [
  ["all", "All"],
  ["paid", "To ship"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["pending", "Unpaid"],
  ["failed", "Failed"],
  ["expired", "Expired"],
];

const LABEL = {
  paid: "To ship",
  shipped: "Shipped",
  delivered: "Delivered",
  pending: "Unpaid",
  failed: "Failed",
  expired: "Expired",
};

const when = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

function OrderDetail({ orderRef, onChanged, onAuthError }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tick, setTick] = useState(0);
  const reload = () => setTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;

    getOrder(orderRef)
      .then((o) => {
        if (!cancelled) setOrder(o);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof AuthError) onAuthError();
        else setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [orderRef, tick, onAuthError]);

  // next = the status the order moves to, message = what to tell the owner
  const act = async (fn, next, message) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      reload();
      onChanged(next, message);
    } catch (e) {
      if (e instanceof AuthError) onAuthError();
      else setError(e.message);
    }
    setBusy(false);
  };

  if (!order) return <p className="adm-note">{error || "Loading…"}</p>;

  const c = order.customer;
  const addressText = [c.name, c.address, [c.city, c.state].filter(Boolean).join(", "), c.country, c.phone]
    .filter(Boolean)
    .join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addressText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the address is still on screen to select */
    }
  };

  return (
    <div className="adm-detail">
      {order.needsAttention && (
        <div className="adm-alert" role="alert">
          <p>
            <strong>Needs your attention:</strong> {order.needsAttention}
          </p>
          <button type="button" className="adm-btn" disabled={busy} onClick={() => act(() => resolveOrder(order.ref), null, "Marked as handled.")}>
            Mark as handled
          </button>
        </div>
      )}

      <div className="adm-cols">
        <section>
          <h3 className="adm-h3">Deliver to</h3>
          <address className="adm-address">
            {c.name}
            <br />
            {c.address}
            <br />
            {[c.city, c.state].filter(Boolean).join(", ")}
            <br />
            {c.country}
          </address>
          <p className="adm-contact">
            <a href={`tel:${c.phone}`}>{c.phone}</a> · <a href={`mailto:${c.email}`}>{c.email}</a>
          </p>
          <button type="button" className="adm-btn" onClick={copy}>
            {copied ? "Copied" : "Copy address"}
          </button>
        </section>

        <section>
          <h3 className="adm-h3">Items</h3>
          <ul className="adm-items">
            {order.items.map((i, n) => (
              <li key={n}>
                <span>
                  {i.name}
                  <small>
                    {i.variant}
                    {i.size ? ` · ${i.size}` : " · One size"} · ×{i.qty}
                  </small>
                </span>
                <span>{formatPrice(i.unitPrice * i.qty, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="adm-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal, order.currency)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{formatPrice(order.shippingFee, order.currency)}</dd>
            </div>
            <div className="adm-total">
              <dt>Total ({order.currency})</dt>
              <dd>{formatPrice(order.total, order.currency)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <p className="adm-timeline">
        Placed {when(order.createdAt)}
        {order.paidAt && ` · paid ${when(order.paidAt)}`}
        {order.shippedAt && ` · shipped ${when(order.shippedAt)}`}
        {order.deliveredAt && ` · delivered ${when(order.deliveredAt)}`}
      </p>
      {order.trackingNote && <p className="adm-timeline">Delivery note sent: {order.trackingNote}</p>}

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}

      {order.status === "paid" && (
        <div className="adm-actions">
          <label className="adm-field">
            <span>Delivery note for the customer (optional, e.g. rider name or tracking number)</span>
            <textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            disabled={busy}
            onClick={() =>
              act(
                () => setOrderStatus(order.ref, "shipped", note),
                "shipped",
                `${order.ref} marked shipped. The customer has been emailed.`
              )
            }
          >
            {busy ? "Saving…" : "Mark shipped and email the customer"}
          </button>
        </div>
      )}

      {order.status === "shipped" && (
        <div className="adm-actions">
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            disabled={busy}
            onClick={() => act(() => setOrderStatus(order.ref, "delivered"), "delivered", `${order.ref} marked delivered.`)}
          >
            Mark delivered
          </button>
          <button type="button" className="adm-btn" disabled={busy} onClick={() => act(() => setOrderStatus(order.ref, "paid"), "paid", `${order.ref} moved back to "to ship".`)}>
            Undo: back to &quot;to ship&quot;
          </button>
        </div>
      )}

      {order.status === "pending" && <p className="adm-note">Waiting for the customer to pay. Unpaid orders expire after 30 minutes.</p>}
    </div>
  );
}

function AdminOrders({ onAuthError }) {
  const [status, setStatus] = useState("paid");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState("");

  // wait a moment after typing before searching
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    listOrders({ status, q: query })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError("");
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof AuthError) onAuthError();
        else setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [status, query, tick, onAuthError]);

  // after an action: refresh, follow the order to its new list, say what happened
  const changed = (next, message) => {
    reload();
    if (next && status !== "all") setStatus(next);
    if (message) {
      setToast(message);
      setTimeout(() => setToast(""), 4000);
    }
  };

  // new orders show up by themselves
  useEffect(() => {
    const t = setInterval(reload, 30000);
    return () => clearInterval(t);
  }, [reload]);

  const counts = data?.counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section>
      {data?.attention > 0 && (
        <p className="adm-alert" role="status">
          {data.attention} order{data.attention > 1 ? "s" : ""} flagged &quot;needs attention&quot;. Look for the ⚠ below.
        </p>
      )}

      <div className="adm-chips" role="group" aria-label="Filter orders">
        {FILTERS.map(([id, label]) => (
          <button
            type="button"
            key={id}
            aria-pressed={status === id}
            className={`adm-chip ${status === id ? "is-active" : ""}`}
            onClick={() => setStatus(id)}
          >
            {label}
            <span>{id === "all" ? total : counts[id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="adm-bar">
        <input
          type="search"
          className="adm-input"
          placeholder="Search name, email or order number"
          aria-label="Search orders"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="adm-btn" onClick={reload}>
          Refresh
        </button>
      </div>

      {toast && (
        <p className="adm-toast" role="status">
          {toast}
        </p>
      )}

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}

      {data && data.orders.length === 0 && <p className="adm-note">No orders here.</p>}

      <ul className="adm-list">
        {data?.orders.map((o) => (
          <li key={o.ref} className={`adm-row ${open === o.ref ? "is-open" : ""}`}>
            <button
              type="button"
              className="adm-row-head"
              aria-expanded={open === o.ref}
              onClick={() => setOpen(open === o.ref ? null : o.ref)}
            >
              <span className="adm-ref">
                {o.needs_attention && <span title="Needs attention">⚠ </span>}
                {o.ref}
              </span>
              <span className={`adm-pill adm-pill--${o.status}`}>{LABEL[o.status] ?? o.status}</span>
              <span className="adm-who">
                {o.customer_name}
                <small>
                  {o.city} · {o.item_count} item{o.item_count === 1 ? "" : "s"} · {when(o.created_at)}
                </small>
              </span>
              <span className="adm-amount">{formatPrice(o.total, o.currency)}</span>
            </button>

            {open === o.ref && <OrderDetail orderRef={o.ref} onChanged={changed} onAuthError={onAuthError} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminOrders;
