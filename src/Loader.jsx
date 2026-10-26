import { useEffect } from "react";
import "./Loader.css";

function Loader({ onComplete }) {
  useEffect(() => {
    const finish = setTimeout(onComplete, 2700);
    return () => clearTimeout(finish);
  }, [onComplete]);

  return (
    <div className="loader" role="status" aria-label="Loading ZUEZ">
      <div className="loader-flash" aria-hidden="true" />

      <div className="loader-content">
        <div className="loader-word" aria-hidden="true">
          ZUEZ
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <polyline points="56,0 47,42 57,44 44,100" />
          </svg>
        </div>

        <div className="loader-bar">
          <div className="loader-progress" />
        </div>
      </div>
    </div>
  );
}

export default Loader;
