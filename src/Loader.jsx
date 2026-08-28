
import { useEffect, useState } from "react";
import "./Loader.css";

function Loader({ onComplete }) {
  const words = ["GOOD", "BOLD", "IT"];

  const [wordIndex, setWordIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const changeWord = (nextIndex, delay) => {
      return setTimeout(() => {
        setIsExiting(true);

        setTimeout(() => {
          setWordIndex(nextIndex);
          setIsExiting(false);
        }, 280);
      }, delay);
    };

    const firstChange = changeWord(1, 900);
    const secondChange = changeWord(2, 1750);

    const finish = setTimeout(() => {
      onComplete();
    }, 2700);

    return () => {
      clearTimeout(firstChange);
      clearTimeout(secondChange);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <div className="loader">
      <div className="loader-content">

        <div className="loader-word">
          <span className="loader-look">LOOK</span>

          <span
            className={`loader-changing-word ${
              isExiting ? "word-exit" : ""
            }`}
          >
            {words[wordIndex]}
          </span>
        </div>

        <div className="loader-bar">
          <div className="loader-progress" />
        </div>

      </div>
    </div>
  );
}

export default Loader;