// public/js/cart.js
const API = "/api/cart";
const ADDRESS_API = "/api/address";
const SHIPPING_FEE = 0; // Free shipping

 // default payment
let selectedPayment = null;
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
function initializePaymentMethods() {

  const radios =
    document.querySelectorAll('input[name="payment"]');

  // No payment methods available
  if (radios.length === 0) {
    selectedPayment = null;
    return;
  }

  // IMPORTANT:
  // Do not automatically select anything.
  selectedPayment = null;

  radios.forEach(radio => {

    radio.checked = false;

    radio.addEventListener("change", () => {
      selectedPayment = radio.value;


    });

  });
}


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

    // -----------------------
    // CHECK PAYMENT METHOD
    // -----------------------
    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    try {

      // =========================================
      // PAYSTACK
      // =========================================
      
      if (selectedPayment === "paystack") {

        const res = await fetch(
          "/api/paystack/cart-checkout",
          {
            method: "POST",
            credentials: "include"
          }
        );

        const rawResponse = await res.text();

        let data;

        try {
          data = JSON.parse(rawResponse);
        } catch (error) {

          console.error(
            "Paystack returned non-JSON response:",
            rawResponse
          );

          alert(
            `Server error (${res.status}). Check the browser console and terminal.`
          );

          return;
        }


        if (!res.ok || !data.success) {

          console.error(
            "Paystack checkout failed:",
            data
          );

          alert(
            data.message ||
            data.error ||
            "Failed to start Paystack checkout"
          );

          return;
        }

        if (data.authorization_url) {

          window.location.href =
            data.authorization_url;

          return;
        }

        console.error(
          "Paystack authorization URL missing:",
          data
        );

        alert(
          "Paystack checkout URL was not returned."
        );

        return;
      }




      // =========================================
      // STRIPE
      // =========================================
      if (selectedPayment === "stripe") {

        const res = await fetch(
          "/api/stripe/cart-checkout",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            credentials: "include"
          }
        );

        let data;

        try {
          data = await res.json();
        } catch (jsonError) {

          console.error(
            "Invalid Stripe server response:",
            jsonError
          );

          alert(
            "The server returned an invalid response."
          );

          return;
        }

        if (!res.ok || !data.url) {

          console.error(
            "Stripe checkout failed:",
            data
          );

          alert(
            data.message ||
            data.error ||
            "Failed to start card checkout"
          );

          return;
        }

        // Stripe checkout
        window.location.href = data.url;

        return;
      }


      // =========================================
      // UNKNOWN PAYMENT METHOD
      // =========================================

      console.error(
        "Unknown payment method:",
        selectedPayment
      );

      alert(
        "Please select a valid payment method."
      );

    } catch (err) {

      console.error(
        "Checkout error:",
        err
      );

      alert(
        "Something went wrong during checkout."
      );
    }

  });


document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  initializePaymentMethods();
});