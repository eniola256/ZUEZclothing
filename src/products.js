// Edit this file to change what is in the shop.
// cat: "men" | "women" | "unisex"   (these drive the menu filters)
// isNew: true puts the piece under the "New" filter

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "unisex", label: "Unisex" },
  { id: "new", label: "New" },
];

export const PRODUCTS = [
  { id: 1, name: "Pinstripe Off-Duty Shorts", price: "$28.00", cat: "unisex", isNew: true, img: "./t6.png", hoverImg: "./t6-hover.png" },
  { id: 2, name: "Borough Cap", price: "$24.00", cat: "unisex", isNew: true, img: "./t2.png", hoverImg: "./t2-hover.png" },
  { id: 3, name: "Raw Denim Wide-Leg", price: "$32.00", cat: "men", isNew: true, img: "./t3.png", hoverImg: "./t3-hover.png" },
  { id: 4, name: "Technical Sling Pack", price: "$36.00", cat: "unisex", isNew: true, img: "./t4.png", hoverImg: "./t4-hover.png" },
  { id: 5, name: "Tank Watch", price: "$48.00", cat: "unisex", isNew: false, img: "./t5.png", hoverImg: "./t5-hover.png" },
  { id: 6, name: "Piped Tech Tee", price: "$26.00", cat: "unisex", isNew: false, img: "./t1.png", hoverImg: "./t1-hover.png" },
  { id: 7, name: "Wide Leg Trousers", price: "$34.00", cat: "men", isNew: false, img: "./t7.png", hoverImg: "./t7-hover.png" },
  { id: 8, name: "Good Luck Cap", price: "$30.00", cat: "unisex", isNew: false, img: "./t13.png", hoverImg: "./t13-hover.png" },
  { id: 9, name: "Grey Sweat Shorts", price: "$30.00", cat: "unisex", isNew: false, img: "./t9.png", hoverImg: "./t9-hover.png" },
  { id: 10, name: "Striped Match Jersey", price: "$22.00", cat: "men", isNew: false, img: "./t10.png", hoverImg: "./t10-hover.png" },
  { id: 11, name: "Baggy Charm Jeans", price: "$30.00", cat: "women", isNew: false, img: "./t11.png", hoverImg: "./t11-hover.png" },
  { id: 12, name: "Grey Sweatpants", price: "$26.00", cat: "unisex", isNew: false, img: "./t12.png", hoverImg: "./t12-hover.png" },
  { id: 13, name: "Angel Boy Shirt", price: "$15.00", cat: "men", isNew: false, img: "./t8.png", hoverImg: "./t8-hover.png" },
];

export function matchesFilter(product, filter) {
  if (filter === "all") return true;
  if (filter === "new") return product.isNew;
  return product.cat === filter;
}
