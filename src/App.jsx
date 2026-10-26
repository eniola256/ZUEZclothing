import { useState, useCallback } from "react";

import NavBar from "./NavBar.jsx";
import Hero from "./Hero.jsx";
import Shop from "./Shop.jsx";
import Footer from "./Footer.jsx";
import Loader from "./Loader.jsx";

function App() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const handleLoaded = useCallback(() => setLoading(false), []);

  const handleFilter = useCallback((id) => {
    setFilter(id);
    requestAnimationFrame(() => {
      document
        .getElementById("shop")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      {loading && <Loader onComplete={handleLoaded} />}

      <NavBar filter={filter} onFilter={handleFilter} />

      <Hero isLoading={loading} />

      <Shop filter={filter} onFilter={handleFilter} />

      <Footer />
    </>
  );
}

export default App;
