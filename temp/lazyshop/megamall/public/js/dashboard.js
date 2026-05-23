//public/js/dashboard.js
import { getCurrentUser } from "./userService.js";

const menuToggle =
  document.getElementById("menuToggle");

const sidebar =
  document.getElementById("sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Close sidebar when clicking menu item
document.querySelectorAll(".sidebar li")
  .forEach(item => {
    item.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  });

function openProduct(productId){
  window.location.href = `/product/${productId}`;
}

// ------------------ INIT ------------------
async function init() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "/register";
    return;
  }

  document.getElementById("welcomeText").textContent = `Welcome, ${user.name}`;
  document.getElementById("emailText").textContent = user.email;

  
}

// ------------------ TAB SWITCH ------------------
document.querySelectorAll(".sidebar li").forEach(item => {
  item.addEventListener("click", () => {
    const tab = item.dataset.tab;

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(`${tab}Tab`).classList.add("active");
  });
});

// ------------------ CART ------------------

async function loadCart() {

  const res = await fetch("/api/cart", {
    credentials: "include",
  });

  const data = await res.json();

  const container =
    document.getElementById("cartItems");

  container.innerHTML = "";

  if (!data.cart || !data.cart.items.length) {

    container.innerHTML =
      "<p>Your cart is empty.</p>";

    return;
  }

  container.innerHTML =
    '<div class="grid"></div>';

  const grid =
    container.querySelector(".grid");

  data.cart.items.forEach(item => {

    const p = item.productId;

    const div =
      document.createElement("div");

    div.className = "product-card";

    div.innerHTML = `
    
      <img
        src="${p.images?.[0] || ''}"
        alt="${p.name}"
      >

      <div class="product-info">

        <h4>${p.name}</h4>

        <p>Qty: ${item.quantity}</p>

        <button class="btn remove-btn">
          Remove
        </button>

      </div>
    `;

    // OPEN PRODUCT
    div.addEventListener("click", (e) => {

      // Prevent remove button click
      if (e.target.closest(".remove-btn")) {
        return;
      }

      window.location.href =
        `/product/${p._id}`;
    });

    // REMOVE ITEM
    div.querySelector(".remove-btn")
      .addEventListener("click", async (e) => {

        e.stopPropagation();

        await fetch("/api/cart/remove", {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          credentials: "include",

          body: JSON.stringify({
            productId: p._id , selectedOptions: item.selectedOptions || {}
          })
        });

        loadCart();
      });

    grid.appendChild(div);
  });
}

// ------------------ WISHLIST ------------------
async function loadWishlist() {

  const res = await fetch("/api/wishlist", {
    credentials: "include",
  });

  const data = await res.json();

  const container =
    document.getElementById("wishlistItems");

  container.innerHTML = "";

  if (
    !data.wishlist ||
    !data.wishlist.items ||
    !data.wishlist.items.length
  ) {
    container.innerHTML =
      "<p>Your wishlist is empty.</p>";
    return;
  }

  container.innerHTML =
    '<div class="grid"></div>';

  const grid =
    container.querySelector(".grid");

  data.wishlist.items.forEach(item => {

    const p = item.productId;

    const div =
      document.createElement("div");

    div.className = "product-card";

    div.innerHTML = `
      <img
        src="${p.images?.[0] || ''}"
        alt="${p.name}"
      >

      <div class="product-info">

        <h4>${p.name}</h4>

        <p>$${p.price.toFixed(2)}</p>

        <button class="btn remove-btn">
          Remove
        </button>

      </div>
    `;

    // OPEN PRODUCT PAGE (click anywhere except button)
    div.addEventListener("click", (e) => {

      if (e.target.closest(".remove-btn")) {
        return;
      }

      window.location.href =
        `/product/${p._id}`;
    });

    // REMOVE FROM WISHLIST
    div.querySelector(".remove-btn")
      .addEventListener("click", async (e) => {

        e.stopPropagation();

        const res = await fetch(
          "/api/wishlist/remove",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              productId: p._id
            })
          }
        );

        const result = await res.json();

        console.log(result);

        loadWishlist();
      });

    grid.appendChild(div);
  });
}

// ------------------ RECENTLY VIEWED ------------------
async function loadRecent() {

  try {

    const res = await fetch("/api/recent", {
      credentials: "include"
    });

    if (!res.ok) {
      console.error("Failed to load recent views");
      return;
    }

    const data = await res.json();

    const container =
      document.getElementById("recentItems");

    // EMPTY STATE
    if (
      !data.recent ||
      !data.recent.items ||
      data.recent.items.length === 0
    ) {
      container.innerHTML = `
        <div class="card empty-state">
          <h3>No Recent Views</h3>
          <p>Products you view will appear here.</p>
        </div>
      `;
      return;
    }

    // GRID
    container.innerHTML =
      '<div class="grid"></div>';

    const grid =
      container.querySelector(".grid");

    data.recent.items.forEach(item => {

      const p = item.productId;

      const div =
        document.createElement("div");

      div.className = "product-card";

      div.innerHTML = `
        <img
          src="${p.images?.[0] || ''}"
          alt="${p.name}"
        >

        <div class="product-info">

          <h4>${p.name}</h4>

          <p>$${p.price.toFixed(2)}</p>

        </div>
      `;

      // OPEN PRODUCT PAGE
      div.addEventListener("click", () => {
        window.location.href =
          `/product/${p._id}`;
      });

      grid.appendChild(div);
    });

  } catch (err) {
    console.error("Recent view error:", err);
  }
}

// ------------------ ORDERS (LIST STYLE) ------------------
async function loadOrders() {

  const res = await fetch("/api/orders", {
    credentials: "include"
  });

  if (!res.ok) {
    console.error("Orders API failed:", res.status);
    return;
  }

  const data = await res.json();
  const container = document.getElementById("ordersItems");

  if (!data.orders || data.orders.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3>No Orders Yet</h3>
        <p>You haven’t placed any orders yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  data.orders.forEach(order => {

    // Extract product names
    const productNames = order.items
      .map(i => i.product?.name)
      .filter(Boolean);

    // Create short preview like: A, B, C...
    const preview = productNames.length > 3
      ? productNames.slice(0, 3).join(", ") + "..."
      : productNames.join(", ");

    const div = document.createElement("div");
    div.className = "order-list-item";

    div.innerHTML = `
      <div class="order-top">
        <h4>Order #${order.orderNumber || order._id.slice(-6)}</h4>
        <span class="status-badge status-${order.orderStatus}">
          ${order.orderStatus}
        </span>
      </div>

      <div class="order-body">
        <p><strong>Products:</strong> ${preview}</p>
        <p><strong>Total:</strong> $${order.totalAmount}</p>
        <p style="font-size:12px; opacity:0.7;">
          Payment: ${order.paymentStatus}
        </p>
      </div>
    `;

    // optional click → order detail page
    div.addEventListener("click", () => {
      window.location.href = `/order.html?id=${order._id}`;
    });

    container.appendChild(div);
  });
}

// ------------------ LOGOUT ------------------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });

    // IMPORTANT: clear frontend fallback state
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    window.location.href = "/register";
  } catch (err) {
    console.error("Logout failed:", err);
  }
});

// ------------------ LOAD ALL ------------------
document.addEventListener("DOMContentLoaded", () => {
  init();
  loadCart();
  loadWishlist();
  loadOrders();
  loadRecent();
});