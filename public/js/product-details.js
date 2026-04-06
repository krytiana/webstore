// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");

    try {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      // ❌ Ignore invalid selectors (like /checkout?...)
      console.warn("Invalid selector:", href);
    }
  });
});

// Format product description
function formatDescription(text) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith("-")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${line.substring(1).trim()}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += (!line.includes(".") && line.length < 60) ? `<h3>${line}</h3>` : `<p>${line}</p>`;
    }
  });

  if (inList) html += "</ul>";
  return html;
}

// Apply description & toggle
document.addEventListener("DOMContentLoaded", () => {
  const descEl = document.getElementById("desc");
  const btn = document.getElementById("toggleDesc");

  if (!descEl) return;

  const raw = descEl.getAttribute("data-description");
  const text = JSON.parse(raw || '""');

  descEl.innerHTML = formatDescription(text);

  if (btn && descEl.scrollHeight <= descEl.clientHeight) btn.style.display = "none";

  if (btn) {
    btn.addEventListener("click", () => {
      descEl.classList.toggle("collapsed");
      btn.textContent = descEl.classList.contains("collapsed") ? "Read More" : "Show Less";
    });
  }
});

import { getCurrentUser } from "/js/userService.js";

// ----------------------------
// ELEMENTS
// ----------------------------
const priceCards = document.querySelectorAll(".price-card");
const ctaBtn = document.getElementById("getWebsiteBtn");
const productSlug = ctaBtn?.dataset.product;

// ----------------------------
// PLAN MAP
// ----------------------------
const planMap = {
  "Source Code": "sourceCode",
  "Assisted Setup": "assistedSetup",
  "Done For You": "doneForYou"
};

// ----------------------------
// DEFAULT SELECTION
// ----------------------------
let defaultCard = Array.from(priceCards).find(
  c => c.querySelector("h3")?.textContent?.trim() === "Assisted Setup"
);

if (defaultCard) {
  priceCards.forEach(c => c.classList.remove("featured"));
  defaultCard.classList.add("featured");

  if (ctaBtn && productSlug) {
    ctaBtn.href = `/checkout?product=${productSlug}&plan=assistedSetup`;
  }
}

// ----------------------------
// CTA CLICK (AUTH CHECK)
// ----------------------------
if (ctaBtn) {
  ctaBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = await getCurrentUser();

    if (!user) {
      alert("Please login first");

      // 🔥 Better UX (redirect back after login)
      const url = ctaBtn.getAttribute("href");
      window.location.href = "/login?redirect=" + encodeURIComponent(url);
      return;
    }

    const url = ctaBtn.getAttribute("href");

    if (url && url !== "#") {
      window.location.href = url;
    } else {
      alert("Please select a plan first");
    }
  });
}

// ----------------------------
// PLAN CLICK
// ----------------------------
priceCards.forEach(card => {
  card.addEventListener("click", () => {
    priceCards.forEach(c => c.classList.remove("featured"));
    card.classList.add("featured");

    const planName = card.querySelector("h3")?.textContent?.trim();
    const plan = planMap[planName];

    if (ctaBtn && productSlug && plan) {
      ctaBtn.href = `/checkout?product=${productSlug}&plan=${plan}`;
    }
  });
});