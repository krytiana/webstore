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

function formatDescription(text) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith("-")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${line.substring(1).trim()}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      if (!line.includes(".") && line.length < 60) {
        html += `<h3>${line}</h3>`;
      } else {
        html += `<p>${line}</p>`;
      }
    }
  });

  if (inList) html += "</ul>";

  return html;
}


// APPLY IT
document.addEventListener("DOMContentLoaded", () => {
  const descEl = document.getElementById("desc");

  if (!descEl) return;

  const raw = descEl.getAttribute("data-description");
  const text = JSON.parse(raw);

  descEl.innerHTML = formatDescription(text);
});

document.addEventListener("DOMContentLoaded", () => {
  const descEl = document.getElementById("desc");
  const btn = document.getElementById("toggleDesc");

  if (!descEl) return;

  const raw = descEl.getAttribute("data-description");
  const text = JSON.parse(raw);

  descEl.innerHTML = formatDescription(text);

  if (descEl.scrollHeight <= descEl.clientHeight) {
  btn.style.display = "none";
}

  // TOGGLE LOGIC
  btn.addEventListener("click", () => {
    descEl.classList.toggle("collapsed");

    if (descEl.classList.contains("collapsed")) {
      btn.textContent = "Read More";
    } else {
      btn.textContent = "Show Less";
    }
  });
});