// ===============================
// PRODUCT DETAIL SCRIPT
// ===============================

// Get product ID
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Find product
const product = products.find(p => p.id === productId);
if (!product) {
  document.body.innerHTML = "<h2>Product not found</h2>";
  throw new Error("Product not found");
}

// Title
document.title = `${product.name} | FashionFemme`;

// Basic info
document.querySelector(".product-info h1").textContent = product.name;
document.querySelector(".price").textContent = `$${product.price.toFixed(2)}`;

// Rating
document.querySelector(".rating").innerHTML =
  "★".repeat(Math.floor(product.rating)) +
  "☆".repeat(5 - Math.floor(product.rating)) +
  ` <span>(${product.reviews} reviews)</span>`;

// ===============================
// DESCRIPTION
// ===============================
const descContainer = document.getElementById("productDescription");
descContainer.innerHTML = "";
product.description.split("||").forEach(line => {
  const p = document.createElement("p");
  p.textContent = line.trim();
  descContainer.appendChild(p);
});

// ===============================
// IMAGES
// ===============================
const mainImage = document.getElementById("mainProductImage");
const thumbnailRow = document.querySelector(".thumbnail-row");

mainImage.src = product.images[0];
thumbnailRow.innerHTML = "";

product.images.forEach((img, index) => {
  const thumb = document.createElement("img");
  thumb.src = img;
  thumb.className = "thumb" + (index === 0 ? " active" : "");

  thumb.onclick = () => {
    mainImage.src = img;
    document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
  };

  thumbnailRow.appendChild(thumb);
});

// ===============================
// SPECS
// ===============================
const specsList = document.getElementById("productSpecs");
specsList.innerHTML = "";

if (product.specs) {
  product.specs.split("|").forEach(spec => {
    const [key, value] = spec.split(":");
    const li = document.createElement("li");
    li.innerHTML = `<strong>${key.trim()}:</strong> ${value.trim()}`;
    specsList.appendChild(li);
  });
}

// ===============================
// PRODUCT OPTIONS (SIZE / COLOR)
// ===============================
const optionsContainer = document.getElementById("productOptions");
let selectedSize = null;
let selectedColor = null;

if (product.options) {
  // SIZE
  if (product.options.sizes) {
    const sizeBlock = document.createElement("div");
    sizeBlock.className = "option-block";
    sizeBlock.innerHTML = `<p>Select Size</p>`;

    product.options.sizes.forEach(size => {
      const btn = document.createElement("button");
      btn.textContent = size;

      btn.onclick = () => {
        selectedSize = size;
        // remove active from all sibling buttons
        sizeBlock.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        // add active to clicked
        btn.classList.add("active");
      };

      sizeBlock.appendChild(btn);
    });

    optionsContainer.appendChild(sizeBlock);
  }

  // COLOR
  if (product.options.colors) {
    const colorBlock = document.createElement("div");
    colorBlock.className = "option-block";
    colorBlock.innerHTML = `<p>Select Color</p>`;

    product.options.colors.forEach(color => {
      const btn = document.createElement("button");
      btn.textContent = color;

      btn.onclick = () => {
        selectedColor = color;
        // remove active from all sibling buttons
        colorBlock.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        // add active to clicked
        btn.classList.add("active");
      };

      colorBlock.appendChild(btn);
    });

    optionsContainer.appendChild(colorBlock);
  }
}
// ===============================
// CART LOGIC (with size & color)
// ===============================
let quantity = 1;
const qtyInput = document.getElementById("quantityInput");

document.getElementById("increaseQty").onclick = () => {
  quantity++;
  qtyInput.value = quantity;
};

document.getElementById("decreaseQty").onclick = () => {
  if (quantity > 1) quantity--;
  qtyInput.value = quantity;
};

document.querySelector(".add-to-cart").onclick = () => {
  // ✅ REQUIRE SELECTIONS IF OPTIONS EXIST
  if (product.options) {
    if (product.options.sizes && !selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }

    if (product.options.colors && !selectedColor) {
      alert("Please select a color before adding to cart.");
      return;
    }
  }

  let cart = getCart();

  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    quantity
  };

  if (selectedSize) cartItem.size = selectedSize;
  if (selectedColor) cartItem.color = selectedColor;

  const existing = cart.find(
    i =>
      i.id === cartItem.id &&
      (i.size || null) === (cartItem.size || null) &&
      (i.color || null) === (cartItem.color || null)
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push(cartItem);
  }

  saveCart(cart);
  updateCartBadges();
  alert("Item added to cart!");
};

// ===============================
// SMART + LAZY RECOMMENDED
// ===============================

function getRecommendedProducts(current, limit = 4) {
  return products
    .filter(p => p.id !== current.id)
    .map(p => {
      let score = 0;
      if (p.category === current.category) score += 3;
      if (p.tags && current.tags) {
        score += p.tags.filter(t => current.tags.includes(t)).length * 2;
      }
      return { ...p, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function renderRecommendedLazy() {
  const container = document.getElementById("recommendedProducts");
  const recommended = getRecommendedProducts(product);

  container.innerHTML = "";

  recommended.forEach(p => {
    const card = document.createElement("div");
    card.className = "recommended-card";

    card.innerHTML = `
      <a href="productDetail.html?id=${p.id}">
        <img src="${p.images[0]}" loading="lazy">
      </a>
      <h4>${p.name}</h4>
      <p>$${p.price.toFixed(2)}</p>
      <button>Add to Cart</button>
    `;

    card.querySelector("button").onclick = () => {
      let cart = getCart();
      const exist = cart.find(i => i.id === p.id);
      if (exist) exist.quantity += 1;
      else cart.push({ id: p.id, name: p.name, price: p.price, image: p.images[0], quantity: 1 });
      saveCart(cart);
    };

    container.appendChild(card);
  });
}

// Intersection Observer
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    renderRecommendedLazy();
    observer.disconnect();
  }
}, { threshold: 0.2 });

observer.observe(document.querySelector(".recommended"));