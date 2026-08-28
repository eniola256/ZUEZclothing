
import { useEffect, useRef } from "react";
import "./Footer.css";

function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.classList.add("is-visible");
          observer.unobserve(footer);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="site-footer" ref={footerRef}>
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
      <span>buildwithaetech</span>, let's create a  thoughtful digital experiences
      through clean design, purposeful development, and modern technology.
      Carefully crafted.
    </p>



      <div className="footer-divide" />

      <div className="footer-bottom">
        <div className="footer-brand">
          <span className="brand-name">buildwithaetech</span>
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
      <a
        href="https://www.instagram.com/buildwithaetech"
        target="_blank"
        rel="noopener noreferrer"
      >
        Instagram
      </a>

      <a
        href="https://x.com/eniola_345"
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>

      <a
        href="https://www.tiktok.com/@buildwithaetech"
        target="_blank"
        rel="noopener noreferrer"
      >
        TikTok
      </a>
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

