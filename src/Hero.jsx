import "./Hero.css";

function Hero({ isLoading }) {
  return (
    <header className={`hero ${isLoading ? "hero-loading" : "hero-ready"}`}>
      <div className="hero-mast">
        <h1 className="hero-title" aria-label="ZUEZ">
          {"ZUEZ".split("").map((letter, i) => (
            <span className="hero-mask" key={i} aria-hidden="true">
              <span className="hero-letter">{letter}</span>
            </span>
          ))}
        </h1>

        <svg
          className="hero-bolt"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <polyline points="56,0 47,42 57,44 44,100" />
        </svg>
      </div>

      <div className="hero-strip">
        <span>Issue 001</span>
        <span>The Current</span>
        <span>Thirteen pieces</span>
      </div>

      <div className="hero-cover">
        <span className="kicker">Cover story</span>

        <p className="hero-headline">
          Baggy, <em>charged,</em> unbothered.
        </p>

        <p className="hero-blurb">
          Drop 001 is thirteen pieces cut loose and built to be seen from
          across the street.
        </p>

        <a className="hero-link" href="#shop">
          Shop the issue
        </a>
      </div>
    </header>
  );
}

export default Hero;
