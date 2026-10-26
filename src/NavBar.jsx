import "./NavBar.css";
import { CATEGORIES } from "./products.js";

function NavBar({ filter, onFilter }) {
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

      <button type="button" className="nav-bag">
        <span className="nav-dot" aria-hidden="true" />
        Bag
      </button>
    </nav>
  );
}

export default NavBar;
