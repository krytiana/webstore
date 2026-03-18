// main.js

const dressGrid = document.getElementById("dress-grid");
const shoeGrid = document.getElementById("shoe-grid");
const accessoriesGrid = document.getElementById("accessories-grid");
const lightingGrid = document.getElementById("lighting-grid");
const kitchenGrid = document.getElementById("kitchen-grid");

const dresses = products.filter(p => p.category === "dress");
const shoes = products.filter(p => p.category === "shoe");
const accessories = products.filter(p => p.category === "accessories");
const lighting = products.filter(p => p.category === "light");
const kitchen = products.filter(p => p.category === "kitchen");

function renderProducts(list, container) {
  container.innerHTML = "";

  list.forEach(product => {
    container.innerHTML += `
      <a href="productDetail.html?id=${product.id}" class="product-link">
        <div class="product-card">
          <img src="${product.images[0]}" alt="${product.name}">
          <h4>${product.name}</h4>
          <p>$${product.price.toFixed(2)}</p>
        </div>
      </a>
    `;
  });
}

renderProducts(dresses, dressGrid);
renderProducts(shoes, shoeGrid);
renderProducts(accessories, accessoriesGrid);
renderProducts(lighting, lightingGrid);
renderProducts(kitchen, kitchenGrid);
