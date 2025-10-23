const resetWebflowStyles = () => {
  document.querySelectorAll('[data-w-id]').forEach((el) => {
    const style = el.getAttribute('style');
    if (!style) return;
    if (/opacity:\s*0/.test(style)) {
      el.style.opacity = '1';
    }
    if (/transform:/.test(style)) {
      el.style.transform = 'none';
    }
  });
};

const smoothScroll = (targetId) => {
  const target = document.querySelector(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const initCtaForm = () => {
  const form = document.querySelector('.cta_form-grid');
  if (!form) return;

  const statusEl = form.querySelector('.cta_form-status');
  const submitButton = form.querySelector('.cta_form-submit');
  const defaultButtonText = submitButton?.textContent ?? '';

  const updateStatus = (message, state) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('cta_form-status--success', 'cta_form-status--error');
    if (state) {
      statusEl.classList.add(`cta_form-status--${state}`);
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateStatus('');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch('https://formsubmit.co/ajax/sam@bluehavenbrands.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const isSuccess = data.success === true || data.success === 'true';

      if (!isSuccess) {
        throw new Error(data.message || 'Submission failed');
      }

      form.reset();
      updateStatus("Thanks! We'll be in touch soon.", 'success');
    } catch (error) {
      updateStatus('Something went wrong. Please try again or email sam@bluehavenbrands.com.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  resetWebflowStyles();
  initCtaForm();
  const navMenu = document.querySelector('.nav_menu');
  const navButton = document.querySelector('.navbar1_menu-button');
  const overlay = document.getElementById('w-nav-overlay-0');

  const closeNav = () => {
    if (navMenu) navMenu.classList.remove('w--open');
    if (navButton) navButton.classList.remove('w--open');
    if (overlay) overlay.style.display = 'none';
  };

  if (navButton && navMenu) {
    navButton.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('w--open');
      navButton.classList.toggle('w--open', isOpen);
      if (overlay) overlay.style.display = isOpen ? 'block' : 'none';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeNav);
  }

  document.querySelectorAll('.nav_menu a, .mobile-nav_content a, .footer2_link, .btn.btn-primary, .btn.btn_reverse').forEach((anchor) => {
    const { hash } = anchor;
    if (!hash || hash.length <= 1) return;
    anchor.addEventListener('click', (event) => {
      if (document.getElementById(hash.substring(1))) {
        event.preventDefault();
        smoothScroll(hash);
        closeNav();
      }
    });
  });


  const animatedItems = document.querySelectorAll('.animate-item');
  if (animatedItems.length) {
    const animateObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.animateDelay || '0');
        setTimeout(() => {
          el.classList.add('is-visible');
        }, delay * 1000);
        observer.unobserve(el);
      });
    }, { threshold: 0.2 });
    animatedItems.forEach((el) => animateObserver.observe(el));
  }
  document.querySelectorAll('.mobile-dropdown').forEach((dropdown) => {
    const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
    const list = dropdown.querySelector('.nav_dropdown');
    if (!toggle || !list) return;
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', (!expanded).toString());
      dropdown.classList.toggle('is-open', !expanded);
      list.classList.toggle('w--open', !expanded);
    });
  });

  document.querySelectorAll('.alt-light-accordion_component').forEach((component) => {
    const items = component.querySelectorAll('.alt-light-accordion_item');
    items.forEach((item, index) => {
      const question = item.querySelector('.alt-light-accordion_question');
      const body = item.querySelector('.alt-light-accordion_body');
      const icon = item.querySelector('.alt-light-accordion_expand svg');
      if (!question || !body) return;
      item.style.opacity = '1';
      item.style.transform = 'none';
      if (index === 0) {
        question.setAttribute('aria-expanded', 'true');
        body.style.height = body.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(-45deg)';
      } else {
        question.setAttribute('aria-expanded', 'false');
        body.style.height = '0px';
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
      question.addEventListener('click', () => {
        const expanded = question.getAttribute('aria-expanded') === 'true';
        items.forEach((other) => {
          if (other === item) return;
          const otherQuestion = other.querySelector('.alt-light-accordion_question');
          const otherBody = other.querySelector('.alt-light-accordion_body');
          const otherIcon = other.querySelector('.alt-light-accordion_expand svg');
          if (otherQuestion && otherBody) {
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherBody.style.height = '0px';
          }
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        });
        if (!expanded) {
          question.setAttribute('aria-expanded', 'true');
          body.style.height = body.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(-45deg)';
        } else {
          question.setAttribute('aria-expanded', 'false');
          body.style.height = '0px';
          if (icon) icon.style.transform = 'rotate(0deg)';
        }
      });
    });
  });

  document.querySelectorAll('.hover-accordon5_component').forEach((component) => {
    const rows = Array.from(component.querySelectorAll('.accordion5_row'));
    const applyState = (row, active) => {
      row.classList.toggle('active', active);
      row.style.opacity = '1';
      row.style.transform = 'none';
      const paragraph = row.querySelector('.accordion5_paragraph');
      const relParent = row.querySelector('.accordion5_rel-parent');
      const arrowLink = row.querySelector('.services_arrow-link');
      if (paragraph) {
        paragraph.style.display = active ? 'block' : 'none';
        paragraph.style.opacity = active ? '1' : '0';
        paragraph.style.transform = active ? 'translateY(0)' : 'translateY(25px)';
      }
      if (relParent) {
        relParent.style.display = active ? 'block' : 'none';
        relParent.style.opacity = active ? '1' : '0';
        relParent.style.transform = active ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(25px)';
      }
      if (arrowLink) {
        arrowLink.style.display = active ? 'flex' : 'none';
        arrowLink.style.opacity = active ? '1' : '0';
        arrowLink.style.maxHeight = active ? '100px' : '0px';
        arrowLink.style.transform = active ? 'translateY(0)' : 'translateY(25px)';
      }
    };
    const setActive = (target) => {
      rows.forEach((row) => applyState(row, row === target));
    };
    if (rows.length) setActive(rows[0]);
    rows.forEach((row) => {
      row.addEventListener('click', () => setActive(row));
      row.addEventListener('mouseenter', () => setActive(row));
    });
  });


  document.querySelectorAll('.basic-tabs_component').forEach((tabs) => {
    const links = tabs.querySelectorAll('.w-tab-link');
    const panes = tabs.querySelectorAll('.w-tab-pane');
    if (!links.length || !panes.length) return;

    const setActive = (targetLink) => {
      const targetName = targetLink.getAttribute('data-w-tab');
      links.forEach((link) => {
        const isActive = link === targetLink;
        link.classList.toggle('w--current', isActive);
        link.setAttribute('aria-selected', String(isActive));
        if (isActive) {
          link.style.opacity = '1';
          link.style.transform = 'none';
        }
      });
      panes.forEach((pane) => {
        const match = pane.getAttribute('data-w-tab');
        const isActive = match === targetName;
        pane.classList.toggle('w--tab-active', isActive);
        pane.style.display = isActive ? 'block' : 'none';
      });
    };

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setActive(link);
      });
    });

    setActive(links[0]);
  });

  document.querySelectorAll('.accordion__style2').forEach((accordion) => {
    accordion.querySelectorAll('.accordion__block').forEach((block) => {
      const title = block.querySelector('.accordion__title');
      const content = block.querySelector('.accordion__content');
      if (!title || !content) return;
      content.style.display = block.classList.contains('active') ? 'block' : 'none';
      title.addEventListener('click', () => {
        const isActive = block.classList.contains('active');
        accordion.querySelectorAll('.accordion__block').forEach((other) => {
          other.classList.remove('active');
          const otherContent = other.querySelector('.accordion__content');
          if (otherContent) otherContent.style.display = 'none';
        });
        if (!isActive) {
          block.classList.add('active');
          content.style.display = 'block';
        }
      });
    });
  });
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const targetValue = Number(el.dataset.count || el.textContent || 0);
        const startValue = el.dataset.start !== undefined ? Number(el.dataset.start) : 0;
        const duration = Number(el.dataset.duration || '1200');
        const diff = targetValue - startValue;
        const isCountdown = diff < 0;
        let start = null;

        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const currentValue = isCountdown
            ? Math.ceil(startValue + diff * progress)
            : Math.floor(startValue + diff * progress);
          el.textContent = currentValue.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = targetValue.toLocaleString();
          }
        };

        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((counter) => observer.observe(counter));
  }
});
