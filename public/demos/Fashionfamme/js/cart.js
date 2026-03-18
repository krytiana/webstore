// ===============================
// CART STORAGE HELPERS
// ===============================

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===============================
// RENDER CART
// ===============================

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const totalItemsEl = document.getElementById("totalItems");
  const totalPriceEl = document.getElementById("totalPrice");

  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    totalItemsEl.textContent = 0;
    totalPriceEl.textContent = "0.00";
    return;
  }

  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach((item, index) => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    // Only show size/color if they exist
    const sizeHtml = item.size ? `<p>Size: ${item.size}</p>` : "";
    const colorHtml = item.color ? `<p>Color: ${item.color}</p>` : "";

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-info">
        <h4>${item.name}</h4>
        ${sizeHtml}
        ${colorHtml}
        <p>$${item.price.toFixed(2)}</p>

        <div class="cart-qty">
          <button class="qty-btn" data-action="decrease">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-action="increase">+</button>
        </div>

        <button class="remove-btn">Remove</button>
      </div>
    `;

    // Quantity buttons
    cartItem.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "increase") {
          item.quantity++;
        } else if (btn.dataset.action === "decrease" && item.quantity > 1) {
          item.quantity--;
        }

        saveCart(cart);
        renderCart();
      });
    });

    // Remove button
    cartItem.querySelector(".remove-btn").addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });

    cartItemsContainer.appendChild(cartItem);
  });

  totalItemsEl.textContent = totalItems;
  totalPriceEl.textContent = totalPrice.toFixed(2);
}

// Initial render
renderCart();