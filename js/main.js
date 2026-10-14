document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const navWrap = document.getElementById("primaryNav");
  const themeToggle = document.getElementById("themeToggle");

  // Header state + active navigation
  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 20);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeMenu = () => {
    navWrap.classList.remove("open");
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle?.addEventListener("click", () => {
    const open = navWrap.classList.toggle("open");
    body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav-link, .nav-wrap .btn").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Theme preference
  const storedTheme = localStorage.getItem("haywhy-theme");
  if (storedTheme === "dark") body.classList.add("dark");

  const updateThemeIcon = () => {
    const dark = body.classList.contains("dark");
    themeToggle.innerHTML = dark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };
  updateThemeIcon();

  themeToggle?.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("haywhy-theme", body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
  });

  // Smooth anchor navigation with fallback for browsers that ignore CSS.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Reveal on scroll
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // Portfolio filters
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;

      projectCards.forEach(card => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });

  // Project modal
  const modal = document.getElementById("projectModal");
  const modalArt = document.getElementById("modalArt");
  const modalTitle = document.getElementById("modalTitle");
  const modalType = document.getElementById("modalType");
  const modalClose = document.getElementById("modalClose");
  let lastFocused = null;

  const openModal = card => {
    lastFocused = document.activeElement;
    modalTitle.textContent = card.dataset.title;
    modalType.textContent = card.dataset.type;
    const art = card.querySelector(".project-art");
    modalArt.className = "modal-art " + [...art.classList].filter(c => c.startsWith("art-")).join(" ");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("menu-open");
    modalClose.focus();
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");
    lastFocused?.focus();
  };

  projectCards.forEach(card => {
    card.addEventListener("click", () => openModal(card));
  });
  modalClose.addEventListener("click", closeModal);
  modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // FAQ accordion
  document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
      const isOpen = question.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-question").forEach(q => {
        q.setAttribute("aria-expanded", "false");
        q.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        question.setAttribute("aria-expanded", "true");
        const answer = question.nextElementSibling;
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Quote slider
  const slides = [...document.querySelectorAll(".quote-slide")];
  const quoteCount = document.getElementById("quoteCount");
  let quoteIndex = 0;

  const showQuote = index => {
    quoteIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === quoteIndex));
    quoteCount.textContent = `${String(quoteIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };

  document.getElementById("quotePrev")?.addEventListener("click", () => showQuote(quoteIndex - 1));
  document.getElementById("quoteNext")?.addEventListener("click", () => showQuote(quoteIndex + 1));

  // Contact form validation
  const form = document.getElementById("contactForm");
  const toast = document.getElementById("toast");

  form.addEventListener("submit", e => {
    e.preventDefault();

    const fields = [...form.querySelectorAll("input, select, textarea")];
    let valid = true;

    fields.forEach(field => {
      if (!field.checkValidity()) {
        field.classList.add("is-invalid");
        valid = false;
      } else {
        field.classList.remove("is-invalid");
      }
    });

    if (!valid) {
      const firstInvalid = form.querySelector(".is-invalid");
      firstInvalid?.focus();
      return;
    }

    toast.classList.add("show");
    form.reset();
    setTimeout(() => toast.classList.remove("show"), 4000);
  });

  // Remove validation state as users correct fields.
  form.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("input", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
    });
    field.addEventListener("change", () => {
      if (field.checkValidity()) field.classList.remove("is-invalid");
    });
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Update active nav link while scrolling
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

  sections.forEach(section => sectionObserver.observe(section));
});
