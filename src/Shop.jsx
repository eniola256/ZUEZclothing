import { useEffect, useRef } from "react";
import "./Shop.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Pinstripe Off-Duty Shorts",
    price: "$28.00",
    img: "./t6.png",
    hoverImg: "./t6-hover.png",
  },
  {
    id: 2,
    name: "Borough Cap",
    price: "$24.00",
    img: "./t2.png",
    hoverImg: "./t2-hover.png",
  },
  {
    id: 3,
    name: "Raw Denim Wide-Leg",
    price: "$32.00",
    img: "./t3.png",
    hoverImg: "./t3-hover.png",
  },
  {
    id: 4,
    name: "Technical Sling Pack",
    price: "$36.00",
    img: "./t4.png",
    hoverImg: "./t4-hover.png",
  },
  {
    id: 5,
    name: "Tank Watch",
    price: "$48.00",
    img: "./t5.png",
    hoverImg: "./t5-hover.png",
  },
  {
    id: 6,
    name: "Piped Tech Tee",
    price: "$26.00",
    img: "./t1.png",
    hoverImg: "./t1-hover.png",
  },
  {
    id: 7,
    name: "Wide Leg Trousers",
    price: "$34.00",
    img: "./t7.png",
    hoverImg: "./t7-hover.png",
  },
  {
    id: 8,
    name: "Good Luck Cap",
    price: "$30.00",
    img: "./t13.png",
    hoverImg: "./t13-hover.png",
  },
  {
    id: 9,
    name: "Grey Sweat Shorts",
    price: "$30.00",
    img: "./t9.png",
    hoverImg: "./t9-hover.png",
  },
  {
    id: 10,
    name: "Striped Match Jersey",
    price: "$22.00",
    img: "./t10.png",
    hoverImg: "./t10-hover.png",
  },
  {
    id: 11,
    name: "Baggy Charm Jeans",
    price: "$30.00",
    img: "./t11.png",
    hoverImg: "./t11-hover.png",
  },
  {
    id: 12,
    name: "Grey Sweatpants",
    price: "$26.00",
    img: "./t12.png",
    hoverImg: "./t12-hover.png",
  },
  {
    id: 13,
    name: "Angel Boy Shirt",
    price: "$15.00",
    img: "./t8.png",
    hoverImg: "./t8-hover.png",
  },
];

function Shop() {
  const shopRef = useRef(null);

  useEffect(() => {
    const shop = shopRef.current;

    if (!shop) return;

    const images = shop.querySelectorAll(".product-image");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    images.forEach((image) => observer.observe(image));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="shop" ref={shopRef}>
      {PRODUCTS.map((product, index) => (
        <div
          className="product"
          key={product.id}
          style={{
            "--desktop-delay": `${(index % 4) * 0.16}s`,
            "--mobile-delay": `${(index % 2) * 0.16}s`,
          }}
        >
          <div className="product-image">
            <img
              className="img-bg"
              src={product.img}
              alt={product.name}
            />

            <img
              className="img-hover"
              src={product.hoverImg}
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="product-info">
            <span className="product-name">{product.name}</span>
            <span className="product-price">{product.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Shop