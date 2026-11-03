import "./NavBar.css";
import { CATEGORIES, CURRENCIES } from "./products.js";
import { useCart } from "./cartState.js";
import { useCurrency } from "./currencyState.js";

function NavBar({ filter, onFilter }) {
  const { count, openCart } = useCart();
  const { currency, setCurrency } = useCurrency();

  return (
    <nav className="nav" aria-label="Shop categories">
      <ul className="nav-filters">
        {CATEGORIES.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onFilter(c.id)}
              aria-pressed={filter === c.id}
              className={`nav-filter ${filter === c.id ? "active" : ""}`}
            >
              {c.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-currency" role="group" aria-label="Pay in">
        {CURRENCIES.map((c) => (
          <button
            type="button"
            key={c.code}
            aria-pressed={currency === c.code}
            aria-label={c.label}
            className={currency === c.code ? "active" : ""}
            onClick={() => setCurrency(c.code)}
          >
            {c.symbol}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="nav-bag"
        onClick={openCart}
        aria-label={count > 0 ? `Bag, ${count} items` : "Bag"}
      >
        <span className="nav-dot" aria-hidden="true" />
        Bag{count > 0 ? ` (${count})` : ""}
      </button>
    </nav>
  );
}

export default NavBar;
