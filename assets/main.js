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
    let currentActive = null;
    const toggleElement = (element, active, fallbackDisplay = 'block', instantHide = false) => {
      if (!element) return;
      const defaultDisplay = element.dataset.defaultDisplay || fallbackDisplay;
      if (!element.dataset.defaultDisplay) {
        element.dataset.defaultDisplay = defaultDisplay;
      }
      const token = Number(element.dataset.toggleToken || '0') + 1;
      element.dataset.toggleToken = String(token);
      const show = () => {
        element.dataset.toggleState = 'show';
        element.style.display = element.dataset.defaultDisplay;
        requestAnimationFrame(() => {
          element.classList.add('is-visible');
        });
      };
      const hide = () => {
        element.dataset.toggleState = 'hide';
        if (instantHide) {
          element.classList.remove('is-visible');
          element.style.display = 'none';
          return;
        }
        const handleTransitionEnd = (event) => {
          if (event.target !== element) return;
          if (element.dataset.toggleToken !== String(token)) return;
          element.style.display = 'none';
        };
        const startHide = () => {
          element.addEventListener('transitionend', handleTransitionEnd, { once: true });
          element.classList.remove('is-visible');
        };
        requestAnimationFrame(startHide);
        setTimeout(() => {
          if (element.dataset.toggleToken === String(token)) {
            element.style.display = 'none';
          }
        }, 600);
      };
      if (active) {
        show();
      } else {
        hide();
      }
    };
    const applyState = (row, isActive, instantHide = false) => {
      row.classList.toggle('active', isActive);
      row.style.opacity = '1';
      row.style.transform = 'none';
      toggleElement(row.querySelector('.accordion5_paragraph'), isActive, 'block', instantHide);
      toggleElement(row.querySelector('.accordion5_rel-parent'), isActive, 'block', instantHide);
      toggleElement(row.querySelector('.services_arrow-link'), isActive, 'flex', instantHide);
    };
    const activateRow = (target) => {
      if (!target || target === currentActive) return;
      applyState(target, true);
      if (currentActive) {
        applyState(currentActive, false, true);
      }
      currentActive = target;
    };
    const tabsComponents = Array.from(document.querySelectorAll('.basic-tabs_component'));
    const attachLearnMore = (row) => {
      const link = row.querySelector('.services_learn-more');
      const tabTarget = row.dataset.tabTarget || link?.dataset.tabTarget;
      if (!link) return;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (tabTarget) {
          tabsComponents.forEach((tabs) => {
            tabs.dispatchEvent(new CustomEvent('changeTab', { detail: { tabName: tabTarget } }));
          });
        }
        smoothScroll('#how-we-work');
      });
    };
    if (rows.length) {
      currentActive = rows[0];
      applyState(currentActive, true);
      rows.forEach((row) => {
        if (row !== currentActive) {
          applyState(row, false);
        }
      });
    }
    rows.forEach((row) => {
      row.addEventListener('click', () => activateRow(row));
      attachLearnMore(row);
    });
  });

  document.querySelectorAll('.basic-tabs_component').forEach((tabs) => {
    const links = tabs.querySelectorAll('.w-tab-link');
    const panes = tabs.querySelectorAll('.w-tab-pane');
    if (!links.length || !panes.length) return;

    const setActive = (targetLink) => {
      const targetName = targetLink.getAttribute('data-w-tab');
      if (targetName) {
        tabs.setAttribute('data-current', targetName);
      }
      links.forEach((link) => {
        const isActive = link === targetLink;
        link.classList.toggle('w--current', isActive);
        link.setAttribute('aria-selected', String(isActive));
        link.setAttribute('tabindex', isActive ? '0' : '-1');
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
        pane.setAttribute('aria-hidden', String(!isActive));
        if (!isActive) {
          pane.setAttribute('hidden', 'true');
        } else {
          pane.removeAttribute('hidden');
        }
      });
    };

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setActive(link);
      });
    });

    tabs.addEventListener('changeTab', (event) => {
      const tabName = event.detail?.tabName;
      if (!tabName) return;
      const targetLink = Array.from(links).find(
        (link) => link.getAttribute('data-w-tab') === tabName || link.id === tabName,
      );
      if (targetLink) {
        setActive(targetLink);
        if (typeof targetLink.focus === 'function') {
          targetLink.focus({ preventScroll: true });
        }
      }
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
