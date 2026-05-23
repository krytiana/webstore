// ===============================
// PRODUCT DETAIL INTERACTIVITY
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const productBtn = document.querySelector(".add-to-cart");
  const productId = productBtn?.dataset.id;

  // ===============================
  // RECENT VIEW
  // ===============================
  if (productId) {
    fetch("/api/recent/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ productId })
    }).catch(err => console.error(err));
  }

  // ===============================
  // IMAGE SWITCH
  // ===============================
  const mainImage = document.getElementById("mainProductImage");
  const thumbnails = document.querySelectorAll(".thumbnail");

  thumbnails.forEach(thumb => {
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
      thumbnails.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // ===============================
  // OPTIONS (dynamic)
  // ===============================
  let selectedOptions = {};

  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      const type = btn.dataset.type;
      const value = btn.dataset.value;

      selectedOptions[type] = value;

      document
        .querySelectorAll(`.option-btn[data-type="${type}"]`)
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
    });
  });

  // ===============================
  // QUANTITY
  // ===============================
  let quantity = 1;
  const qtyInput = document.getElementById("quantityInput");

  document.getElementById("increaseQty")?.addEventListener("click", () => {
    quantity++;
    if (qtyInput) qtyInput.value = quantity;
  });

  document.getElementById("decreaseQty")?.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      if (qtyInput) qtyInput.value = quantity;
    }
  });

  // ===============================
  // ADD TO CART (FIXED)
  // ===============================
  productBtn?.addEventListener("click", async () => {

    // -----------------------------
    // CHECK REQUIRED OPTIONS FIRST
    // -----------------------------
    const optionButtons = document.querySelectorAll(".option-btn");
    const hasOptions = optionButtons.length > 0;

    if (hasOptions) {

      const requiredTypes = [...new Set(
        Array.from(optionButtons).map(btn => btn.dataset.type)
      )];

      const missing = requiredTypes.filter(type => !selectedOptions[type]);

      if (missing.length > 0) {
        alert(`Please select: ${missing.join(", ")}`);
        return;
      }
    }

    // -----------------------------
    // SEND TO SERVER
    // -----------------------------
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        productId,
        quantity,
        selectedOptions
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Added to cart ✅");

      loadCartCount?.();

      // RESET
      selectedOptions = {};

      document.querySelectorAll(".option-btn.active")
        .forEach(btn => btn.classList.remove("active"));

      quantity = 1;
      const qtyInput = document.getElementById("quantityInput");
      if (qtyInput) qtyInput.value = 1;

    } else {
      alert(data.message || "Failed to add to cart");
    }
  });

  // ===============================
  // WISHLIST (FIXED SAME WAY)
  // ===============================
  document.querySelector(".wishlist")?.addEventListener("click", async (e) => {

    const btn = e.target;

    const res = await fetch("/api/wishlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        productId,
        selectedOptions
      })
    });

    const data = await res.json();

    if (data.success) {
      btn.textContent = "❤️ Added";
      btn.disabled = true;
    } else {
      console.error("Wishlist error:", data);
      alert(data.message || "Failed to add wishlist");
    }
  });

});