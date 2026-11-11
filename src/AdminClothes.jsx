import { useCallback, useEffect, useRef, useState } from "react";
import { AuthError, listProducts, saveProduct, setProductActive, uploadImage } from "./adminApi.js";
import { formatPrice, optimizeImage } from "./products.js";
import { useProducts } from "./productsState.js";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZE_ORDER = ["XXS", ...PRESET_SIZES, "XXXL"];
const sizeRank = (s) => (SIZE_ORDER.indexOf(s) === -1 ? 99 : SIZE_ORDER.indexOf(s));
const naira = (n) => formatPrice(Math.round(n * 100), "NGN");
const dollar = (n) => formatPrice(Math.round(n * 100), "USD");

let keySeed = 0;
const nextKey = () => ++keySeed;

const blankVariant = (sizes) => ({
  key: nextKey(),
  id: null,
  label: "Default",
  color: "",
  images: [],
  stock: Object.fromEntries(sizes.map((s) => [s, "0"])),
});

function toForm(p) {
  if (!p) {
    const sizes = ["S", "M", "L", "XL"];
    return {
      id: null, name: "", description: "", category: "unisex", isNew: true, active: true,
      priceNgn: "", priceUsd: "", sizes, variants: [{ ...blankVariant(sizes), stock: { S: "10", M: "10", L: "10", XL: "10" } }],
    };
  }

  const all = new Set(p.variants.flatMap((v) => Object.keys(v.stock)));
  const sizes = [...all].sort((a, b) => sizeRank(a) - sizeRank(b));

  return {
    id: p.id, name: p.name, description: p.description, category: p.category, isNew: p.isNew, active: p.active,
    priceNgn: String(p.priceNgn), priceUsd: String(p.priceUsd),
    sizes: sizes.length ? sizes : ["S", "M", "L", "XL"],
    variants: p.variants.map((v) => ({
      key: nextKey(), id: v.id, label: v.label, color: v.color || "", images: v.images || [],
      stock: Object.fromEntries(Object.entries(v.stock).map(([s, q]) => [s, String(q)])),
    })),
  };
}

function toPayload(f) {
  return {
    id: f.id, name: f.name, description: f.description, category: f.category, isNew: f.isNew, active: f.active,
    priceNgn: f.priceNgn, priceUsd: f.priceUsd,
    variants: f.variants.map((v) => ({
      id: v.id, label: v.label, color: v.color || null, images: v.images,
      stock: Object.fromEntries(f.sizes.map((s) => [s, Number(v.stock[s] === "" || v.stock[s] == null ? 0 : v.stock[s])])),
    })),
  };
}

function Photos({ images, onChange, uploadsReady, onAuthError }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const fileRef = useRef(null);

  const upload = async (files) => {
    setBusy(true);
    setError("");
    let next = images;
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        next = [...next, url];
        onChange(next);
      }
    } catch (e) {
      if (e instanceof AuthError) onAuthError();
      else setError(e.message);
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addLink = () => {
    const url = link.trim();
    if (!(url.startsWith("https://") || url.startsWith("/"))) {
      setError("A photo link must start with https:// or /");
      return;
    }
    setError("");
    onChange([...images, url]);
    setLink("");
  };

  return (
    <div className="adm-photos">
      <ul className="adm-thumbs">
        {images.map((url, i) => (
          <li key={url + i}>
            <img src={optimizeImage(url, 200)} alt="" />
            {i === 0 && <span className="adm-main">Main</span>}
            <div>
              {i > 0 && (
                <button type="button" onClick={() => onChange([url, ...images.filter((_, n) => n !== i)])}>
                  Make main
                </button>
              )}
              <button type="button" onClick={() => onChange(images.filter((_, n) => n !== i))}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {uploadsReady ? (
        <label className="adm-btn adm-upload">
          {busy ? "Uploading…" : "Upload photos"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={(e) => e.target.files?.length && upload([...e.target.files])}
          />
        </label>
      ) : (
        <p className="adm-note">Photo upload isn&apos;t set up yet (Cloudinary keys). You can still add a photo by link below.</p>
      )}

      <div className="adm-linkrow">
        <input
          className="adm-input"
          placeholder="…or paste a photo link (https://… or /FileName.png)"
          aria-label="Photo link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
        />
        <button type="button" className="adm-btn" onClick={addLink} disabled={!link.trim()}>
          Add
        </button>
      </div>

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Editor({ initial, uploadsReady, onSaved, onCancel, onAuthError }) {
  const [f, setF] = useState(() => toForm(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [custom, setCustom] = useState("");

  const set = (field) => (e) =>
    setF((x) => ({ ...x, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setVariant = (key, patch) =>
    setF((x) => ({ ...x, variants: x.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)) }));

  const oneSize = f.sizes.length === 1 && f.sizes[0] === "";

  const toggleSize = (s) =>
    setF((x) => {
      const has = x.sizes.includes(s);
      const sizes = (has ? x.sizes.filter((n) => n !== s) : [...x.sizes.filter((n) => n !== ""), s]).sort(
        (a, b) => sizeRank(a) - sizeRank(b)
      );
      return { ...x, sizes: sizes.length ? sizes : x.sizes };
    });

  const setOneSize = (on) =>
    setF((x) => ({ ...x, sizes: on ? [""] : ["S", "M", "L", "XL"] }));

  const addCustomSize = () => {
    const s = custom.trim().toUpperCase().slice(0, 10);
    if (!s) return;
    setF((x) => (x.sizes.includes(s) ? x : { ...x, sizes: [...x.sizes.filter((n) => n !== ""), s].sort((a, b) => sizeRank(a) - sizeRank(b)) }));
    setCustom("");
  };

  const move = (i, d) =>
    setF((x) => {
      const v = [...x.variants];
      const j = i + d;
      if (j < 0 || j >= v.length) return x;
      [v[i], v[j]] = [v[j], v[i]];
      return { ...x, variants: v };
    });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = await saveProduct(toPayload(f));
      onSaved(saved);
    } catch (err) {
      if (err instanceof AuthError) onAuthError();
      else setError(err.message);
    }
    setBusy(false);
  };

  return (
    <form className="adm-editor" onSubmit={submit}>
      <div className="adm-editor-head">
        <h2 className="adm-h2">{f.id ? `Edit ${initial.name}` : "Add a piece"}</h2>
        <button type="button" className="adm-link" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <label className="adm-field">
        <span>Name</span>
        <input className="adm-input" required maxLength={120} value={f.name} onChange={set("name")} />
      </label>

      <label className="adm-field">
        <span>Short description</span>
        <textarea className="adm-input" rows={3} maxLength={1000} value={f.description} onChange={set("description")} />
      </label>

      <div className="adm-grid3">
        <label className="adm-field">
          <span>Category</span>
          <select className="adm-input" value={f.category} onChange={set("category")}>
            <option value="unisex">Unisex</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </label>

        <label className="adm-field">
          <span>Price in Naira (₦)</span>
          <input className="adm-input" required inputMode="decimal" value={f.priceNgn} onChange={set("priceNgn")} placeholder="17000" />
          {Number(f.priceNgn) > 0 && <small>{naira(Number(f.priceNgn))}</small>}
        </label>

        <label className="adm-field">
          <span>Price in Dollars ($)</span>
          <input className="adm-input" required inputMode="decimal" value={f.priceUsd} onChange={set("priceUsd")} placeholder="13" />
          {Number(f.priceUsd) > 0 && <small>{dollar(Number(f.priceUsd))}</small>}
        </label>
      </div>

      <div className="adm-checks">
        <label>
          <input type="checkbox" checked={f.isNew} onChange={set("isNew")} /> Mark as New
        </label>
        <label>
          <input type="checkbox" checked={f.active} onChange={set("active")} /> Show in the shop
        </label>
      </div>

      <fieldset className="adm-fieldset">
        <legend>Sizes (the same for every style)</legend>
        <div className="adm-sizes">
          <label className="adm-chip-check">
            <input type="checkbox" checked={oneSize} onChange={(e) => setOneSize(e.target.checked)} /> One size
          </label>
          {!oneSize &&
            [...new Set([...PRESET_SIZES, ...f.sizes])].sort((a, b) => sizeRank(a) - sizeRank(b)).map((s) => (
              <label key={s} className={`adm-chip-check ${f.sizes.includes(s) ? "is-on" : ""}`}>
                <input type="checkbox" checked={f.sizes.includes(s)} onChange={() => toggleSize(s)} /> {s}
              </label>
            ))}
        </div>
        {!oneSize && (
          <div className="adm-linkrow">
            <input
              className="adm-input"
              placeholder="Other size, e.g. 32"
              aria-label="Other size"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
            />
            <button type="button" className="adm-btn" onClick={addCustomSize} disabled={!custom.trim()}>
              Add size
            </button>
          </div>
        )}
      </fieldset>

      <h3 className="adm-h3">Styles and colours</h3>
      <p className="adm-note">The first style is the one shown in the shop grid.</p>

      {f.variants.map((v, i) => (
        <fieldset className="adm-variant" key={v.key}>
          <legend>
            Style {i + 1}
          </legend>

          <div className="adm-grid2">
            <label className="adm-field">
              <span>Style name</span>
              <input className="adm-input" required maxLength={40} value={v.label} onChange={(e) => setVariant(v.key, { label: e.target.value })} />
            </label>

            <div className="adm-field">
              <span>Colour (optional)</span>
              <div className="adm-colorrow">
                <input
                  type="color"
                  aria-label={`Colour of ${v.label}`}
                  value={v.color || "#888888"}
                  onChange={(e) => setVariant(v.key, { color: e.target.value })}
                />
                <span>{v.color || "No colour: shows the style name"}</span>
                {v.color && (
                  <button type="button" className="adm-link" onClick={() => setVariant(v.key, { color: "" })}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <Photos
            images={v.images}
            uploadsReady={uploadsReady}
            onAuthError={onAuthError}
            onChange={(images) => setVariant(v.key, { images })}
          />

          <div className="adm-stock">
            <span className="adm-stock-title">Stock</span>
            {f.sizes.map((s) => (
              <label key={s} className="adm-stock-cell">
                <span>{s || "One size"}</span>
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={v.stock[s] ?? "0"}
                  onChange={(e) => setVariant(v.key, { stock: { ...v.stock, [s]: e.target.value } })}
                />
              </label>
            ))}
          </div>

          <div className="adm-variant-actions">
            <button type="button" className="adm-link" disabled={i === 0} onClick={() => move(i, -1)}>
              Move up
            </button>
            <button type="button" className="adm-link" disabled={i === f.variants.length - 1} onClick={() => move(i, 1)}>
              Move down
            </button>
            <button
              type="button"
              className="adm-link adm-danger"
              disabled={f.variants.length === 1}
              onClick={() => {
                if (window.confirm(`Remove the style "${v.label}"?`)) setF((x) => ({ ...x, variants: x.variants.filter((n) => n.key !== v.key) }));
              }}
            >
              Remove style
            </button>
          </div>
        </fieldset>
      ))}

      <button type="button" className="adm-btn" onClick={() => setF((x) => ({ ...x, variants: [...x.variants, blankVariant(x.sizes)] }))}>
        + Add another style
      </button>

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}

      <div className="adm-savebar">
        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
          {busy ? "Saving…" : f.id ? "Save changes" : "Add to the shop"}
        </button>
        <button type="button" className="adm-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdminClothes({ onAuthError, uploadsReady }) {
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null); // null = list, "new" = blank form, or a product
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const { refresh: refreshShop } = useProducts();

  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    listProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
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
  }, [tick, onAuthError]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const toggle = async (p) => {
    try {
      await setProductActive(p.id, !p.active);
      reload();
      refreshShop();
    } catch (e) {
      if (e instanceof AuthError) onAuthError();
      else setError(e.message);
    }
  };

  if (editing) {
    return (
      <Editor
        key={editing === "new" ? "new" : editing.id}
        initial={editing === "new" ? null : editing}
        uploadsReady={uploadsReady}
        onAuthError={onAuthError}
        onCancel={() => setEditing(null)}
        onSaved={(saved) => {
          setEditing(null);
          flash(`Saved "${saved.name}".`);
          reload();
          refreshShop();
        }}
      />
    );
  }

  return (
    <section>
      <div className="adm-bar">
        <p className="adm-note">{products ? `${products.length} pieces` : "Loading…"}</p>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setEditing("new")}>
          + Add a piece
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

      <ul className="adm-list">
        {products?.map((p) => {
          const stock = p.variants.flatMap((v) => Object.values(v.stock));
          const total = stock.reduce((a, b) => a + b, 0);
          const low = stock.some((q) => q > 0 && q <= 2);

          return (
            <li key={p.id} className={`adm-prod ${p.active ? "" : "is-hidden"}`}>
              <img src={optimizeImage(p.variants[0]?.images?.[0] ?? "", 200)} alt="" />
              <div className="adm-prod-info">
                <strong>{p.name}</strong>
                <small>
                  {naira(p.priceNgn)} · {dollar(p.priceUsd)} · {p.variants.length} style{p.variants.length === 1 ? "" : "s"}
                </small>
                <small>
                  {total === 0 ? <span className="adm-bad">Sold out</span> : `${total} in stock`}
                  {low && total > 0 && <span className="adm-warn"> · some sizes running low</span>}
                  {!p.active && <span className="adm-warn"> · hidden from the shop</span>}
                </small>
              </div>
              <div className="adm-prod-actions">
                <button type="button" className="adm-btn" onClick={() => setEditing(p)}>
                  Edit
                </button>
                <button type="button" className="adm-link" onClick={() => toggle(p)}>
                  {p.active ? "Hide" : "Show"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default AdminClothes;
