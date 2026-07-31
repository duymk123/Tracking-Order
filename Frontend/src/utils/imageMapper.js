export function getImageForProduct(productName) {
  if (!productName) return "/images/product_placeholder.png";
  
  // Use a simple hash of the string to deterministically pick an image
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const images = [
    "/images/product_placeholder.png", // Gadget
    "/images/product_box.png",
    "/images/product_tool.png",
    "/images/product_cable.png"
  ];
  
  const index = Math.abs(hash) % images.length;
  return images[index];
}
