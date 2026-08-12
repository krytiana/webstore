
// ============================================================
// PRODUCT DETAILS PAGE
// ============================================================

import { getCurrentUser } from "/js/userService.js";


// ============================================================
// CONFIGURATION
// ============================================================

const MOBILE_BREAKPOINT = 900;


// ============================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

  link.addEventListener("click", event => {

    const href = link.getAttribute("href");

    if (!href || href === "#") {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

});


// ============================================================
// DESCRIPTION FORMATTER
// ============================================================

function formatDescription(text) {

  if (typeof text !== "string" || !text.trim()) {
    return document.createDocumentFragment();
  }

  const fragment = document.createDocumentFragment();

  const lines = text.split("\n");

  let list = null;

  const closeList = () => {

    if (list) {
      fragment.appendChild(list);
      list = null;
    }

  };


  lines.forEach(rawLine => {

    const line = rawLine.trim();

    if (!line) {
      return;
    }


    // --------------------------------------------------------
    // BULLET LIST
    // --------------------------------------------------------

    if (line.startsWith("-")) {

      if (!list) {
        list = document.createElement("ul");
      }

      const item = document.createElement("li");

      item.textContent = line
        .substring(1)
        .trim();

      list.appendChild(item);

      return;
    }


    // --------------------------------------------------------
    // CLOSE PREVIOUS LIST
    // --------------------------------------------------------

    closeList();


    // --------------------------------------------------------
    // EXPLICIT MARKDOWN-STYLE HEADING
    // --------------------------------------------------------

    if (line.startsWith("## ")) {

      const heading = document.createElement("h3");

      heading.textContent = line
        .substring(3)
        .trim();

      fragment.appendChild(heading);

      return;
    }


    // --------------------------------------------------------
    // NORMAL TEXT
    // --------------------------------------------------------

    const paragraph = document.createElement("p");

    paragraph.textContent = line;

    fragment.appendChild(paragraph);

  });


  closeList();

  return fragment;
}


// ============================================================
// DESCRIPTION + READ MORE
// ============================================================

function initializeDescription() {

  const descEl = document.getElementById("desc");
  const button = document.getElementById("toggleDesc");

  if (!descEl) {
    return;
  }


  const rawDescription =
    descEl.getAttribute("data-description");


  let description = "";


  try {

    description =
      JSON.parse(rawDescription || '""');

  } catch (error) {

    console.error(
      "Failed to parse product description:",
      error
    );

    description = "";

  }


  // ----------------------------------------------------------
  // Render safely using DOM nodes instead of innerHTML.
  // This prevents product description content from becoming
  // executable HTML/JavaScript.
  // ----------------------------------------------------------

  descEl.replaceChildren(
    formatDescription(description)
  );


  if (!button) {
    return;
  }


  // ----------------------------------------------------------
  // Check whether the description actually overflows.
  // ----------------------------------------------------------

  requestAnimationFrame(() => {

    const isOverflowing =
      descEl.scrollHeight > descEl.clientHeight + 1;


    if (!isOverflowing) {

      button.hidden = true;

      descEl.classList.remove("collapsed");

      return;
    }


    button.hidden = false;

  });


  // ----------------------------------------------------------
  // READ MORE / SHOW LESS
  // ----------------------------------------------------------

  button.addEventListener("click", () => {

    const collapsed =
      descEl.classList.toggle("collapsed");


    button.textContent =
      collapsed
        ? "Read More"
        : "Show Less";


    button.setAttribute(
      "aria-expanded",
      String(!collapsed)
    );

  });

}


// ============================================================
// MOBILE PRICING CAROUSEL
// ============================================================

const pricingContainer =
  document.querySelector(".pricing-cards");

const pricingCards =
  document.querySelectorAll(".price-card");

const productSlug =
  pricingContainer?.dataset.product;

const planButtons =
  document.querySelectorAll(".choose-plan");


// ============================================================
// CENTER FEATURED PLAN
// ============================================================

function centerFeaturedPlan() {

  if (!pricingContainer) {
    return;
  }


  // Desktop uses the normal three-column layout.
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    return;
  }


  const featuredCard =
    pricingContainer.querySelector(
      ".price-card.featured"
    );


  if (!featuredCard) {
    return;
  }


  featuredCard.scrollIntoView({
    behavior: "auto",
    block: "nearest",
    inline: "center"
  });

}


// ============================================================
// CARD CLICK → CENTER CARD ON MOBILE
// ============================================================

pricingCards.forEach(card => {

  card.addEventListener("click", event => {

    // Do not interfere with checkout buttons.
    if (event.target.closest(".choose-plan")) {
      return;
    }


    // Desktop does not use the carousel.
    if (window.innerWidth > MOBILE_BREAKPOINT) {
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


    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (!card) {

      console.error(
        "Could not find pricing card."
      );

      return;
    }


    const plan =
      card.dataset.plan;


    // --------------------------------------------------------
    // VALIDATE PRODUCT + PLAN
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // BUILD CHECKOUT URL
    //
    // IMPORTANT:
    // This only identifies the product and plan.
    //
    // The backend MUST retrieve the real product and price
    // from MongoDB. Never trust a price supplied by the browser.
    // --------------------------------------------------------

    const checkoutUrl =
      `/checkout?product=${encodeURIComponent(productSlug)}&plan=${encodeURIComponent(plan)}`;


    // --------------------------------------------------------
    // PREVENT MULTIPLE CLICKS
    // --------------------------------------------------------

    button.disabled = true;

    const originalText =
      button.textContent;

    button.textContent =
      "Checking...";


    try {

      // ------------------------------------------------------
      // CHECK AUTHENTICATION
      // ------------------------------------------------------

      const user =
        await getCurrentUser();


      // ------------------------------------------------------
      // USER NOT LOGGED IN
      // ------------------------------------------------------

      if (!user) {

        const redirectUrl =
          "/register?redirect=" +
          encodeURIComponent(checkoutUrl);


        window.location.href =
          redirectUrl;


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
// INITIAL PAGE SETUP
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeDescription();

  }
);


// ============================================================
// CENTER FEATURED PLAN AFTER PAGE LOAD
// ============================================================

window.addEventListener("load", () => {

  setTimeout(() => {

    centerFeaturedPlan();

  }, 150);

});


// ============================================================
// KEEP FEATURED PLAN CENTERED WHEN CROSSING BREAKPOINT
// ============================================================

let previousWidth =
  window.innerWidth;


window.addEventListener("resize", () => {

  const currentWidth =
    window.innerWidth;


  const crossedBreakpoint =
    (
      previousWidth > MOBILE_BREAKPOINT &&
      currentWidth <= MOBILE_BREAKPOINT
    ) ||
    (
      previousWidth <= MOBILE_BREAKPOINT &&
      currentWidth > MOBILE_BREAKPOINT
    );


  if (crossedBreakpoint) {

    setTimeout(() => {

      centerFeaturedPlan();

    }, 100);

  }


  previousWidth =
    currentWidth;

});

