import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-divider" />

      <div className="footer-statement">
        <h2>
          Made to be worn.
          <br />
          Or judged. Or both.
        </h2>
        <div className="footer-copyright">
          <span className="c-mark">©</span>26
        </div>
      </div>

      <p className="footer-about">
        Created by the ++hellohello team, this store and signature collection
        celebrates our collective creativity and passion for apparel.
        Carefully designed.
      </p>

      <div className="footer-divide" />

      <div className="footer-bottom">
        <div className="footer-brand">
          <span className="brand-name">++ hellohello</span>
          <span>All rights reserved © 2026</span>
        </div>
        <div className="footer-address">
          <span>Libertad 2529</span>
          <span>Office 102</span>
          <span>Montevideo, Uruguay</span>
        </div>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
        </div>
        <div className="footer-links">
          <a href="#">Dribbble</a>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
        </div>
        <div className="footer-links">
          <a href="#">Work</a>
          <a href="#">Services</a>
          <a href="#">About</a>
        </div>
        <div className="footer-links">
          <a href="#">Let's talk</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;