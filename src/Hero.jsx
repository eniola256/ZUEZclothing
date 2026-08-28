import "./Hero.css";

function Hero() {
  return (
    <div className="hero">
      <h1 className="hero-title">
        <span className="hero-letter">L</span>

        <span className="hero-eyes">
          <span className="owl-eye">
            <span className="owl-pupil" />
          </span>

          <span className="owl-eye">
            <span className="owl-pupil" />
          </span>
        </span>

        <span className="hero-letter">K</span>
        <span className="hero-letter">I</span>
        <span className="hero-letter">T</span>
      </h1>

      <div className="hero-content">
        <div className="hero-col">
          <span>LOOKIT</span>
          <span>© 2026</span>
        </div>

        <div className="hero-col hero-about">
          <span>ABOUT</span>
            <p className="hero-description">
              <span>A one-person portfolio drop. Built to test how far</span>
              <span>restraint, contrast and a single color can carry a storefront.</span>
            </p>
        </div>

        <div className="hero-col">
          <span>FAQ</span>
          <span>CONTACT</span>
        </div>
      </div>
    </div>
  );
}

export default Hero;