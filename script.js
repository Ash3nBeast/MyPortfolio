document.addEventListener("DOMContentLoaded", () =>
{
  // ─── Year ──────────────────────────────────────────────────
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

  // ─── Theme Toggle ──────────────────────────────────────────
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle?.querySelector(".theme-icon");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light")
  {
    body.classList.add("light-mode");
    if (themeIcon) themeIcon.textContent = "☀️";
  }

  if (themeToggle)
  {
    themeToggle.addEventListener("click", () =>
    {
      body.classList.toggle("light-mode");
      const isLight = body.classList.contains("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      if (themeIcon) themeIcon.textContent = isLight ? "☀️" : "🌙";
    });
  }

  // ─── Hamburger Menu ────────────────────────────────────────
  const hamburger = document.getElementById("hamburger");
  const mainNav = document.getElementById("main-nav");

  if (hamburger && mainNav)
  {
    hamburger.addEventListener("click", () =>
    {
      const isOpen = mainNav.classList.toggle("nav-open");
      hamburger.classList.toggle("is-active", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    // Close nav when a link is clicked
    mainNav.querySelectorAll("a").forEach((link) =>
    {
      link.addEventListener("click", () =>
      {
        mainNav.classList.remove("nav-open");
        hamburger.classList.remove("is-active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    // Close nav on outside click
    document.addEventListener("click", (e) =>
    {
      if (!mainNav.contains(e.target) && !hamburger.contains(e.target))
      {
        mainNav.classList.remove("nav-open");
        hamburger.classList.remove("is-active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ─── Smooth Scroll + Active Nav ───────────────────────────
  const navLinks = document.querySelectorAll(".main-nav a[href^='#']");

  navLinks.forEach((link) =>
  {
    link.addEventListener("click", (e) =>
    {
      const href = link.getAttribute("href");
      if (!href.startsWith("#")) return;
      e.preventDefault();
      const target = document.getElementById(href.substring(1));
      if (target)
      {
        const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        setTimeout(() => link.classList.remove("active"), 1000);
      }
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll("section[id]");
  function highlightNavOnScroll()
  {
    const scrollY = window.pageYOffset;
    sections.forEach((section) =>
    {
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");
      if (scrollY > sectionTop && scrollY <= sectionTop + section.offsetHeight)
      {
        navLinks.forEach((link) =>
        {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) link.classList.add("active");
        });
      }
    });
  }
  window.addEventListener("scroll", highlightNavOnScroll);
  highlightNavOnScroll();

  // ─── Typing Animation (Hero) ───────────────────────────────
  const phrases = [
    ".NET Full-Stack & Game Developer",
    "Computer Engineer @ BHI",
    "Low-Level Systems Programmer",
    "Unity & C# Game Developer",
    "FPGA & VHDL Designer",
  ];

  const heroRole = document.querySelector(".hero-role");
  if (heroRole)
  {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function typeLoop()
    {
      if (isPaused) return;

      const current = phrases[phraseIndex];

      if (isDeleting)
      {
        charIndex--;
        heroRole.textContent = current.slice(0, charIndex);
        if (charIndex === 0)
        {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          isPaused = true;
          setTimeout(() => { isPaused = false; requestAnimationFrame(typeLoop); }, 400);
          return;
        }
        setTimeout(typeLoop, 35);
      } else
      {
        charIndex++;
        heroRole.textContent = current.slice(0, charIndex);
        if (charIndex === current.length)
        {
          isPaused = true;
          setTimeout(() => { isPaused = false; isDeleting = true; requestAnimationFrame(typeLoop); }, 2200);
          return;
        }
        setTimeout(typeLoop, 65);
      }
    }

    // Add blinking cursor via CSS class
    heroRole.classList.add("typing-cursor");
    setTimeout(typeLoop, 800);
  }

  // ─── Scroll-Reveal Animations ──────────────────────────────
  const revealEls = document.querySelectorAll(".scroll-reveal, .spec-card, .project-card, .cert-card, .timeline-item, .about-card, .contact-card");

  const revealObserver = new IntersectionObserver(
    (entries) =>
    {
      entries.forEach((entry) =>
      {
        if (entry.isIntersecting)
        {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ─── Contact Form (Formspree AJAX) ─────────────────────────
  const contactForm = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  const formSubmitBtn = document.getElementById("form-submit");

  if (contactForm)
  {
    contactForm.addEventListener("submit", async (e) =>
    {
      e.preventDefault();

      const name = document.getElementById("cf-name").value.trim();
      const email = document.getElementById("cf-email").value.trim();
      const message = document.getElementById("cf-message").value.trim();

      if (!name || !email || !message)
      {
        showFormNote("⚠ Please fill in all fields.", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
      {
        showFormNote("⚠ Please enter a valid email address.", "error");
        return;
      }

      // Check if Formspree ID has been configured
      const action = contactForm.getAttribute("action") || "";
      if (action.includes("YOUR_FORM_ID"))
      {
        // Fallback to mailto until Formspree is configured
        const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:abdelrahman2027ahmed@gmail.com?subject=${subject}&body=${body}`;
        showFormNote("✓ Opening your mail client...", "success");
        contactForm.reset();
        return;
      }

      // Formspree AJAX submission
      if (formSubmitBtn)
      {
        formSubmitBtn.disabled = true;
        formSubmitBtn.textContent = "Sending…";
      }

      try
      {
        const res = await fetch(action, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(contactForm),
        });

        if (res.ok)
        {
          showFormNote("✓ Message sent! I'll get back to you soon.", "success");
          contactForm.reset();
        } else
        {
          const data = await res.json();
          const msg = data?.errors?.map((e) => e.message).join(", ") || "Something went wrong.";
          showFormNote(`⚠ ${msg}`, "error");
        }
      } catch
      {
        showFormNote("⚠ Network error. Please email me directly.", "error");
      } finally
      {
        if (formSubmitBtn)
        {
          formSubmitBtn.disabled = false;
          formSubmitBtn.textContent = "Send Message";
        }
      }
    });
  }

  function showFormNote(msg, type)
  {
    if (!formNote) return;
    formNote.textContent = msg;
    formNote.className = `form-note form-note--${type}`;
    setTimeout(() => { formNote.textContent = ""; formNote.className = "form-note"; }, 5000);
  }

  // ─── Back to Top ───────────────────────────────────────────
  const backToTop = document.getElementById("back-to-top");

  if (backToTop)
  {
    window.addEventListener("scroll", () =>
    {
      backToTop.classList.toggle("visible", window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener("click", () =>
    {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
