//js/cartBadge.js

function updateCartBadges() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const headerBadge = document.getElementById("cartCount");
  if (headerBadge) {
    headerBadge.textContent = totalQty;
    headerBadge.style.display = totalQty > 0 ? "inline-block" : "none";
  }

  const floatingBadge = document.getElementById("floatingCartCount");
  if (floatingBadge) {
    floatingBadge.textContent = totalQty;
    floatingBadge.style.display = totalQty > 0 ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", updateCartBadges);

