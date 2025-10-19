document.addEventListener("DOMContentLoaded", () => {
  initFaqAccordion();
  initSmoothScroll();
  initContactForm();
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

function initContactForm() {
  const form = document.querySelector(".contact__form");
  if (!form) return;

  const statusEl = form.querySelector(".form__status");
  const submitButton = form.querySelector(".form__submit");
  const defaultButtonText = submitButton?.textContent ?? "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    updateStatus("");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const formData = new FormData(form);

    try {
      const response = await fetch("https://formsubmit.co/ajax/sam@bluehavenbrands.com", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const isSuccess = data.success === "true" || data.success === true;

      if (!isSuccess) {
        throw new Error(data.message || "Submission failed");
      }

      form.reset();
      updateStatus("Your message has been submitted.", "success");
    } catch (error) {
      updateStatus("Something went wrong. Please try again or email sam@bluehavenbrands.com.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });

  function updateStatus(message, state) {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.classList.remove("form__status--success", "form__status--error");

    if (state) {
      statusEl.classList.add(`form__status--${state}`);
    }
  }
}
