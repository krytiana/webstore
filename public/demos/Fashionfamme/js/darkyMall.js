
const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('search');
let currentCategory = 'all';

function render(list) {
  grid.innerHTML = '';

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <a href="productDetail.html?id=${p.id}" class="product-link">
        <img src="${p.images[0]}" />
        <div class="card-body">
          <strong>${p.name}</strong>
          <div class="price">$${p.price}</div>
          <div class="rating">⭐ ${p.rating} (${p.reviews})</div>
          <button
            type="button"
            class="add-to-cart"
            data-id="${p.id}"
          >
            Add to Cart
          </button>
        </div>
      </a>
    `;

    // Attach event listener INSIDE the loop
    const btn = card.querySelector(".add-to-cart");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(p);
    });

    grid.appendChild(card);
  });
}


function applyFilters(){
  const q = searchInput.value.toLowerCase();
  let list = products.filter(p => p.name.toLowerCase().includes(q));
  if(currentCategory !== 'all') list = list.filter(p => p.category === currentCategory);
  render(list);
}

render(products);

searchInput.addEventListener('input', applyFilters);

document.querySelectorAll('.filters button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    applyFilters();
  })
});

function addToCart(product) {
  const cart = getCart();

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    });
  }

  saveCart(cart);
}


const drawer = document.getElementById("drawer");
const overlay = document.getElementById("drawerOverlay");

document.getElementById("menuBtn").onclick = () => {
  drawer.classList.add("open");
  overlay.classList.add("show");
};

document.getElementById("closeDrawer").onclick = closeDrawer;
overlay.onclick = closeDrawer;

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
}

/* Category filter from drawer */
document.querySelectorAll(".drawer-links button[data-cat]").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.cat;
    applyFilters();
    closeDrawer();
  });
});

