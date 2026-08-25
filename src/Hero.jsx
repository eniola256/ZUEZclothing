import "./Hero.css"

function Hero() {
  return (
    <div className="hero">
      <h1>LOOKIT</h1>
      <div className="hero-content">
        <div className="hero-col">
          <span>LOOKIT</span>
          <span>© 2026</span>
        </div>
        <div className="hero-col hero-about">
          <span>ABOUT</span>
          <p>
            A one-person portfolio drop. Built to test how far restraint,
            contrast and a single color can carry a storefront.
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