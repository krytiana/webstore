// Smooth scroll for pricing
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(link.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});

// Highlight pricing on hover
document.querySelectorAll(".price-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".price-card").forEach(c => c.classList.remove("featured"));
    card.classList.add("featured");
  });
});

