//js/cartBadge.js

async function loadCartCount() {
  const res = await fetch("/api/cart", {
    credentials: "include"
  });

  const data = await res.json();

  const totalQty =
    data.cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const floatingBadge = document.getElementById("floatingCartCount");

  if (floatingBadge) {
    floatingBadge.textContent = totalQty;
    floatingBadge.style.display = totalQty > 0 ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", loadCartCount);