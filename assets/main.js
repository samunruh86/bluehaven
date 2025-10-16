(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.getAttribute("data-state") === "open";
      nav.setAttribute("data-state", isOpen ? "closed" : "open");
      navToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = form.querySelector(".response-note");
  const submitButton = form.querySelector("button[type='submit']");
  const defaultLabel = submitButton?.dataset.label || submitButton?.textContent || "Submit";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!submitButton || !statusEl) return;

    statusEl.textContent = "";
    const formData = new FormData(form);

    if (formData.get("website")) {
      statusEl.textContent = "Something went wrong. Please try again.";
      return;
    }

    if (!form.reportValidity()) {
      statusEl.textContent = "Please complete the required fields.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      statusEl.textContent = "Thanks for reaching out. We will be in touch shortly.";
      form.reset();
    } catch (error) {
      statusEl.textContent = "Unable to send right now. Please email hello@bluehavenbrands.com or retry in a moment.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultLabel;
    }
  });
})();
