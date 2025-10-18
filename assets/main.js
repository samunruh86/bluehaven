document.addEventListener("DOMContentLoaded", () => {
  initFaqAccordion();
  initSmoothScroll();
});

function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq__item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");
    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      faqItems.forEach((other) => {
        if (other !== item) {
          setFaqState(other, false);
        }
      });
      setFaqState(item, !isExpanded);
    });
  });
}

function setFaqState(item, expand) {
  const button = item.querySelector(".faq__question");
  const answer = item.querySelector(".faq__answer");
  const icon = button?.querySelector(".faq__icon");
  if (!button || !answer) return;

  button.setAttribute("aria-expanded", expand ? "true" : "false");
  item.classList.toggle("is-open", expand);
  answer.hidden = !expand;
  if (icon) {
    icon.textContent = expand ? "−" : "+";
  }
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      link.blur();
    });
  });
}
