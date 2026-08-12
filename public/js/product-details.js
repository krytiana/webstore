// ============================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

  link.addEventListener("click", e => {

    const href = link.getAttribute("href");

    if (!href || href === "#") return;

    const target = document.querySelector(href);

    if (target) {

      e.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  });

});


// ============================================================
// FORMAT PRODUCT DESCRIPTION
// ============================================================

function formatDescription(text) {

  const lines = text.split("\n");

  let html = "";
  let inList = false;

  lines.forEach(line => {

    line = line.trim();

    if (!line) return;


    // List item
    if (line.startsWith("-")) {

      if (!inList) {
        html += "<ul>";
        inList = true;
      }

      html += `<li>${line.substring(1).trim()}</li>`;

    }

    else {

      // Close previous list
      if (inList) {
        html += "</ul>";
        inList = false;
      }


      // Heading or paragraph
      if (!line.includes(".") && line.length < 60) {

        html += `<h3>${line}</h3>`;

      }

      else {

        html += `<p>${line}</p>`;

      }

    }

  });


  // Close list if still open
  if (inList) {
    html += "</ul>";
  }

  return html;
}


// ============================================================
// APPLY DESCRIPTION & READ MORE TOGGLE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const descEl = document.getElementById("desc");
  const btn = document.getElementById("toggleDesc");

  if (!descEl) return;


  const raw = descEl.getAttribute("data-description");

  let text = "";

  try {

    text = JSON.parse(raw || '""');

  } catch (error) {

    console.error(
      "Failed to parse product description:",
      error
    );

    text = "";

  }


  descEl.innerHTML = formatDescription(text);


  // Hide Read More if description is short
  if (
    btn &&
    descEl.scrollHeight <= descEl.clientHeight
  ) {

    btn.style.display = "none";

  }


  // Read More / Show Less
  if (btn) {

    btn.addEventListener("click", () => {

      descEl.classList.toggle("collapsed");

      btn.textContent =
        descEl.classList.contains("collapsed")
          ? "Read More"
          : "Show Less";

    });

  }

});


// ============================================================
// PRICING / CHECKOUT
// ============================================================

import { getCurrentUser } from "/js/userService.js";


// Pricing container
const pricingContainer =
  document.querySelector(".pricing-cards");


// Pricing cards
const pricingCards =
  document.querySelectorAll(".price-card");


// Product slug
const productSlug =
  pricingContainer?.dataset.product;


// Choose-plan buttons
const planButtons =
  document.querySelectorAll(".choose-plan");


// ============================================================
// CENTER ASSISTED SETUP BY DEFAULT
// ============================================================

function centerFeaturedPlan() {

  if (!pricingContainer) return;


  // Desktop uses normal 3-column layout
  if (window.innerWidth > 900) return;


  const featuredCard =
    pricingContainer.querySelector(".price-card.featured");


  if (!featuredCard) return;


  featuredCard.scrollIntoView({
    behavior: "auto",
    block: "nearest",
    inline: "center"
  });

}


// Wait until page/images/layout are ready
window.addEventListener("load", () => {

  setTimeout(() => {

    centerFeaturedPlan();

  }, 150);

});


// ============================================================
// CLICK CARD → CENTER CARD
// ============================================================

pricingCards.forEach(card => {

  card.addEventListener("click", event => {


    // Do not interfere with checkout button
    if (event.target.closest(".choose-plan")) {
      return;
    }


    // Only carousel on mobile/tablet
    if (window.innerWidth > 900) {
      return;
    }


    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });

  });

});


// ============================================================
// PLAN BUTTON → CHECKOUT
// ============================================================

planButtons.forEach(button => {

  button.addEventListener("click", async () => {

    const card =
      button.closest(".price-card");


    // Safety check
    if (!card) {

      console.error(
        "Could not find pricing card."
      );

      return;

    }


    // Get plan from data-plan
    const plan = card.dataset.plan;


    // Validate product and plan
    if (!productSlug || !plan) {

      console.error(
        "Missing product slug or plan.",
        {
          productSlug,
          plan
        }
      );

      alert(
        "Unable to continue. Please refresh the page and try again."
      );

      return;

    }


    // Build checkout URL
    const checkoutUrl =
      `/checkout?product=${encodeURIComponent(productSlug)}&plan=${encodeURIComponent(plan)}`;


    // Prevent multiple clicks
    button.disabled = true;


    const originalText =
      button.textContent;


    button.textContent = "Checking...";


    try {

      // Check authentication
      const user =
        await getCurrentUser();


      // ------------------------------------------------------
      // USER NOT LOGGED IN
      // ------------------------------------------------------

      if (!user) {

        window.location.href =
          "/register?redirect=" +
          encodeURIComponent(checkoutUrl);

        return;

      }


      // ------------------------------------------------------
      // USER IS LOGGED IN
      // ------------------------------------------------------

      window.location.href =
        checkoutUrl;


    }

    catch (error) {

      console.error(
        "Authentication check failed:",
        error
      );


      alert(
        "Something went wrong. Please try again."
      );


      button.disabled = false;

      button.textContent =
        originalText;

    }

  });

});


// ============================================================
// KEEP ASSISTED SETUP CENTERED AFTER RESIZE
// ============================================================

let previousWidth = window.innerWidth;

window.addEventListener("resize", () => {

  const currentWidth = window.innerWidth;


  // Only recenter when crossing the
  // desktop/mobile breakpoint
  if (
    (previousWidth > 900 && currentWidth <= 900) ||
    (previousWidth <= 900 && currentWidth > 900)
  ) {

    setTimeout(() => {

      centerFeaturedPlan();

    }, 100);

  }


  previousWidth = currentWidth;

});