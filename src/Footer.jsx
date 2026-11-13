import "./Footer.css";

// Nigerian number 0706… → international format for the WhatsApp link
const WHATSAPP = "2347061649983";
const WHATSAPP_TEXT = "Hi ZUEZ, I'd like to ask about...";

function Footer() {
  const chat = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <footer className="site-footer">
      <div className="footer-watermark" aria-hidden="true">
        ZUEZ
      </div>

      <div className="footer-bar">
        <a
          className="footer-contact"
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact us on WhatsApp
        </a>

        <span className="footer-copy">© 2026 ZUEZ</span>
      </div>
    </footer>
  );
}

export default Footer;
