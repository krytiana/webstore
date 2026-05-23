// public/js/cart.js
const API = "/api/cart";
const ADDRESS_API = "/api/address";
const SHIPPING_FEE = 0; // Free shipping

let selectedPayment = "stripe"; // default payment
let currentCart = null;
let currentAddress = null;

async function loadCart() {
  try {
    const res = await fetch(API, {
      credentials: "include"
    });

    const data = await res.json();

    if (!data.success) throw new Error("Failed to fetch cart");

    currentCart = data.cart;
    renderCart(data.cart);
    loadDefaultAddress();
  } catch (err) {
    console.error("Error loading cart:", err);
  }
}

function renderCart(cart) {
  const container = document.getElementById("cartItems");
  const totalItemsEl = document.getElementById("totalItems");
  const totalPriceEl = document.getElementById("totalPrice");
  const shippingFeeEl = document.getElementById("shippingFee");

  container.innerHTML = "";

  if (!cart || cart.items.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalItemsEl.textContent = 0;
    totalPriceEl.textContent = "0.00";
    shippingFeeEl.textContent = SHIPPING_FEE.toFixed(2);
    updateCartBadge(0);
    return;
  }

  let totalItems = 0;
  let totalPrice = 0;

  cart.items.forEach(item => {
    const p = item.productId;
    if (!p) return;

    totalItems += item.quantity;
    totalPrice += (p.price || 0) * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${p.images?.[0] || ''}" alt="${p.name}" />
      <div class="cart-info">
        <h4>${p.name}</h4>
        ${item.size ? `<p>Size: ${item.size}</p>` : ""}
        ${item.color ? `<p>Color: ${item.color}</p>` : ""}
        <p>$${p.price?.toFixed(2) || 0}</p>
        <div class="cart-qty">
          <button class="qty-btn decrease">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn increase">+</button>
        </div>
        <button class="remove-btn">Remove</button>
      </div>
    `;

    container.appendChild(div);

    div.querySelector(".qty-btn.increase").addEventListener("click", async () => {
      await updateCartItem(p._id, item.selectedOptions || {}, 1);
    });

    div.querySelector(".qty-btn.decrease").addEventListener("click", async () => {
      await updateCartItem(p._id, item.selectedOptions || {}, -1);
    });

    div.querySelector(".remove-btn").addEventListener("click", async () => {
      await updateCartItem(p._id, item.selectedOptions || {}, -9999);
    });
  });

  totalItemsEl.textContent = totalItems;
  totalPriceEl.textContent = totalPrice.toFixed(2);
  shippingFeeEl.textContent = SHIPPING_FEE.toFixed(2);
  updateCartBadge(totalItems);
}

// ----------------------
// Cart item updates
async function updateCartItem(productId, selectedOptions = {}, change) {
  try {
    const res = await fetch(`${API}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        productId,
        selectedOptions,
        change
      })
    });

    const data = await res.json();

    if (data.success) loadCart();
    else console.error("Cart update failed:", data);

  } catch (err) {
    console.error("Error updating cart:", err);
  }
}

// ----------------------
// Cart badge
function updateCartBadge(count) {
  const badge = document.getElementById("floatingCartCount");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
}

// ----------------------
// Load default shipping address
async function loadDefaultAddress() {

  const addrDiv = document.getElementById("defaultAddress");

  if (!addrDiv) return;

  try {

    const res = await fetch(ADDRESS_API, {
      credentials: "include"
    });

    const data = await res.json();

    const defaultAddr =
      data.find(a => a.isDefault) || data[0];

    currentAddress = defaultAddr || null;

    if (!defaultAddr) {

      addrDiv.innerHTML =
        "<p>No shipping address. Add one in your profile.</p>";

      return;
    }

    addrDiv.innerHTML = `
      <strong>${defaultAddr.fullName}</strong><br>
      ${defaultAddr.phone}<br>
      ${defaultAddr.addressLine}, ${defaultAddr.city}<br>
      ${defaultAddr.region}, ${defaultAddr.country}
    `;

  } catch (err) {

    console.error(
      "Failed to load default address:",
      err
    );
  }
}

// ----------------------
// Payment method selection
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener("change", e => selectedPayment = e.target.value);
});

// ----------------------
// Checkout
document.querySelector(".checkout-btn")
?.addEventListener("click", async () => {

  // -----------------------
  // CHECK EMPTY CART
  // -----------------------
  if (
    !currentCart ||
    !currentCart.items ||
    currentCart.items.length === 0
  ) {
    alert("Your cart is empty");
    return;
  }

  // -----------------------
  // CHECK SHIPPING ADDRESS
  // -----------------------
  if (!currentAddress) {
    alert("Please add a shipping address before checkout");
    return;
  }

  const totalPrice =
    parseFloat(
      document.getElementById("totalPrice").textContent
    ) + SHIPPING_FEE;

  try {

    if (selectedPayment === "paystack") {

      alert(
        "paystack not available now, please select card payment"
      );

      return;

    } else {

      const res = await fetch(
        "/api/stripe/cart-checkout",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            amount: totalPrice
          })
        }
      );

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start card checkout");
      }
    }

  } catch (err) {

    console.error("Checkout error:", err);

    alert("Something went wrong during checkout");
  }
});

document.addEventListener("DOMContentLoaded", loadCart);