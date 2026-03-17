const steps = document.querySelectorAll(".step");
const categorySelect = document.querySelector('select[name="category"]');
const customCategoryInput = document.querySelector('input[name="customCategory"]');

let currentStep = 0;

categorySelect.addEventListener("change", () => {
  if (categorySelect.value === "Other") {
    customCategoryInput.style.display = "block";
    customCategoryInput.required = true;
  } else {
    customCategoryInput.style.display = "none";
    customCategoryInput.required = false;
  }
});

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, i) => step.classList.toggle("active", i === currentStep));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".next").forEach(btn => {
  btn.addEventListener("click", () => {
    currentStep++;
    showStep(currentStep);
  });
});

document.querySelectorAll(".prev").forEach(btn => {
  btn.addEventListener("click", () => {
    currentStep--;
    showStep(currentStep);
  });
});

showStep(currentStep);
