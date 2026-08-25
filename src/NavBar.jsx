"use client";
import { useState, useEffect } from "react";
import "./NavBar.css";

const THEMES = [
  { id: "dark", label: "Black / White" },
  { id: "light", label: "White / Black" },
  { id: "blue", label: "Black / Blue" },
];

function NavBar() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <nav>
      <div className="logo">
        <span className="material-symbols-outlined">owl</span>
      </div>
      <div className="nav-contents">
        <div className="nav-links">
          <a href="#">Shop</a>
          <a href="#">Bag</a>
        </div>
        <div className="theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-label={t.label}
              aria-pressed={theme === t.id}
              className={`theme-swatch swatch-${t.id} ${theme === t.id ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
export default NavBar;