
import { useState } from "react";

import NavBar from "./NavBar.jsx";
import Hero from "./Hero.jsx";
import Shop from "./Shop.jsx";
import Footer from "./Footer.jsx";
import Loader from "./Loader.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <Loader onComplete={() => setLoading(false)} />
      )}

      <NavBar />

      <Hero isLoading={loading} />

      <Shop />

      <Footer />
    </>
  );
}

export default App;
