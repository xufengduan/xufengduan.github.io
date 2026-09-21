/**
 * Homepage motion — GSAP + ScrollTrigger + ScrollTo
 * Academic tone: short, once-only reveals; honors prefers-reduced-motion.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileNav = window.matchMedia("(max-width: 992px)");
  var sidebar = document.getElementById("mySidebar");
  var overlay = document.getElementById("myOverlay");
  var modal = document.getElementById("modal01");
  var modalImg = document.getElementById("img01");
  var modalCaption = document.getElementById("caption");
  var modalPanel = modal ? modal.querySelector(".w3-modal-content") : null;
  var lastModalTrigger = null;
  var sidebarTween = null;
  var overlayTween = null;
  var modalTween = null;
  var navObserver = null;

  function bootReady() {
    document.documentElement.classList.remove("gs-preload");
  }

  function headerOffset() {
    return mobileNav.matches ? 76 : 12;
  }

  function setNavExpanded(open) {
    var toggle = document.querySelector(".mobile-header .menu-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }

  function killTween(tween) {
    if (tween) tween.kill();
  }

  function w3_open() {
    if (!sidebar || !overlay) return;
    if (!mobileNav.matches) return;

    sidebar.style.display = "block";
    overlay.style.display = "block";
    overlay.setAttribute("aria-hidden", "false");
    setNavExpanded(true);

    if (typeof gsap === "undefined" || reduceMotion.matches) {
      sidebar.style.opacity = "1";
      overlay.style.opacity = "1";
      return;
    }

    killTween(sidebarTween);
    killTween(overlayTween);
    sidebarTween = gsap.fromTo(
      sidebar,
      { x: -28, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.38, ease: "power3.out", overwrite: "auto" }
    );
    overlayTween = gsap.fromTo(
      overlay,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.28, overwrite: "auto" }
    );
  }

  function w3_close() {
    if (!sidebar || !overlay) return;
    setNavExpanded(false);
    overlay.setAttribute("aria-hidden", "true");

    if (!mobileNav.matches) return;

    if (typeof gsap === "undefined" || reduceMotion.matches) {
      sidebar.style.display = "none";
      overlay.style.display = "none";
      return;
    }

    killTween(sidebarTween);
    killTween(overlayTween);
    sidebarTween = gsap.to(sidebar, {
      x: -20,
      autoAlpha: 0,
      duration: 0.24,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: function () {
        sidebar.style.display = "none";
        gsap.set(sidebar, { clearProps: "transform,opacity,visibility" });
      }
    });
    overlayTween = gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.22,
      overwrite: "auto",
      onComplete: function () {
        overlay.style.display = "none";
      }
    });
  }

  function w3_toggle() {
    if (!sidebar) return;
    if (sidebar.style.display === "block") {
      w3_close();
    } else {
      w3_open();
    }
  }

  function openModal(src, alt) {
    if (!modal || !modalImg) return;
    lastModalTrigger = document.activeElement;
    modalImg.src = src;
    if (modalCaption) modalCaption.textContent = alt || "";

    if (typeof gsap !== "undefined" && !reduceMotion.matches) {
      gsap.set(modal, { autoAlpha: 0 });
      if (modalPanel) gsap.set(modalPanel, { y: 18, scale: 0.96, autoAlpha: 0 });
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector("button");
    if (closeBtn) closeBtn.focus();

    if (typeof gsap === "undefined" || reduceMotion.matches) {
      modal.style.opacity = "1";
      return;
    }

    killTween(modalTween);
    modalTween = gsap.timeline({ defaults: { ease: "power3.out" } });
    modalTween.to(modal, { autoAlpha: 1, duration: 0.28 }, 0);
    if (modalPanel) {
      modalTween.to(modalPanel, { y: 0, scale: 1, autoAlpha: 1, duration: 0.42 }, 0.04);
    }
  }

  function closeModal() {
    if (!modal || modal.style.display !== "block") return;

    function afterClose() {
      modal.style.display = "none";
      document.body.style.overflow = "";
      if (typeof gsap !== "undefined") {
        gsap.set(modalPanel ? [modal, modalPanel] : modal, { clearProps: "transform,opacity,visibility" });
      }
      if (modalImg) modalImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      if (lastModalTrigger && typeof lastModalTrigger.focus === "function") {
        lastModalTrigger.focus();
      }
    }

    if (typeof gsap === "undefined" || reduceMotion.matches) {
      afterClose();
      return;
    }

    killTween(modalTween);
    modalTween = gsap.timeline({ onComplete: afterClose });
    if (modalPanel) {
      modalTween.to(modalPanel, { y: 10, scale: 0.98, autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 0);
    }
    modalTween.to(modal, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
  }

  function onClick(element) {
    openModal(element.src, element.alt);
  }

  function onImageKeydown(event, element) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(element);
    }
  }

  window.w3_open = w3_open;
  window.w3_close = w3_close;
  window.w3_toggle = w3_toggle;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.onClick = onClick;
  window.onImageKeydown = onImageKeydown;

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closeModal();
    if (mobileNav.matches) w3_close();
  });

  mobileNav.addEventListener("change", function (event) {
    if (event.matches) return;
    if (typeof gsap !== "undefined") {
      gsap.set(sidebar, { clearProps: "all" });
    }
    sidebar.style.display = "";
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    setNavExpanded(false);
  });

  function bindFallbackNav() {
    if (navObserver) return;
    var navLinks = document.querySelectorAll('#mySidebar a[href^="#"]');
    var sections = document.querySelectorAll("main section[id]");
    navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  if (typeof gsap === "undefined") {
    bootReady();
    bindFallbackNav();
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (typeof ScrollToPlugin !== "undefined") {
    gsap.registerPlugin(ScrollToPlugin);
  }
  gsap.config({ nullTargetWarn: false });

  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", function () {
    bootReady();
    document.documentElement.classList.remove("gs-ok");
    bindFallbackNav();
  });

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    document.documentElement.classList.add("gs-ok");

    var navLinks = gsap.utils.toArray('#mySidebar a[href^="#"]');
    var sections = gsap.utils.toArray("main section[id]");
    var sidebarName = document.querySelector("#mySidebar .sidebar-name");
    var sidebarRole = document.querySelector("#mySidebar .sidebar-role");
    var navItems = gsap.utils.toArray("#mySidebar .w3-bar-item");
    var eyebrow = document.querySelector("#about .eyebrow");
    var heading = document.querySelector("#about h1");
    var copy = gsap.utils.toArray("#about .about-copy p:not(.eyebrow)");
    var portrait = document.querySelector("#about .profile-photo");
    var links = gsap.utils.toArray("#about .profile-links a");
    var intro = [sidebarName, sidebarRole].concat(navItems, [eyebrow, heading], copy, [portrait], links).filter(Boolean);

    gsap.set(intro, { autoAlpha: 0 });
    bootReady();

    var introTl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 0.06
    });

    if (sidebarName) {
      introTl.fromTo(sidebarName, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0);
    }
    if (sidebarRole) {
      introTl.fromTo(sidebarRole, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.06);
    }
    introTl.fromTo(navItems, { x: -14, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, stagger: 0.04 }, 0.1);
    if (eyebrow) {
      introTl.fromTo(eyebrow, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.08);
    }
    if (heading) {
      introTl.fromTo(heading, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.14);
    }
    introTl.fromTo(copy, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1 }, 0.26);
    if (portrait) {
      introTl.fromTo(
        portrait,
        { y: 22, scale: 0.96, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.95 },
        0.2
      );
    }
    introTl.fromTo(links, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06 }, 0.48);

    introTl.add(function () {
      gsap.set(intro, { clearProps: "transform" });
      if (portrait && typeof ScrollTrigger !== "undefined" && window.matchMedia("(min-width: 681px)").matches) {
        gsap.to(portrait, {
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: "#about",
            start: "top top",
            end: "bottom top",
            scrub: 0.6
          }
        });
      }
    });

    function revealHeading(section) {
      var h4 = section.querySelector("h4");
      if (!h4) return;
      gsap.fromTo(
        h4,
        { y: 18, autoAlpha: 0, "--rule": 0 },
        {
          y: 0,
          autoAlpha: 1,
          "--rule": 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 82%", once: true },
          onComplete: function () {
            gsap.set(h4, { clearProps: "transform" });
            h4.classList.add("gs-lined");
          }
        }
      );
    }

    function reveal(trigger, targets, extra) {
      var els = gsap.utils.toArray(targets);
      if (!els.length) return;
      var vars = extra || {};
      gsap.fromTo(
        els,
        { y: vars.y != null ? vars.y : 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: vars.duration || 0.7,
          stagger: vars.stagger != null ? vars.stagger : 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: trigger,
            start: vars.start || "top 80%",
            once: true
          },
          onComplete: function () {
            gsap.set(this.targets(), { clearProps: "transform" });
            if (vars.onComplete) vars.onComplete.call(this);
          }
        }
      );
    }

    function enableCardHover() {
      gsap.utils.toArray("#selected .curated-row").forEach(function (row) {
        var lift = gsap.to(row, { y: -4, duration: 0.28, ease: "power2.out", paused: true, overwrite: "auto" });
        row.addEventListener("mouseenter", function () { lift.play(); });
        row.addEventListener("mouseleave", function () { lift.reverse(); });
      });
    }

    sections.forEach(function (section) {
      if (section.id === "about") return;
      revealHeading(section);
    });

    reveal("#selected", "#selected .curated-row", { y: 28, stagger: 0.12, onComplete: enableCardHover });
    reveal("#academic-service", "#academic-service .service-block", { y: 22, stagger: 0.12 });
    reveal("#supervision", "#supervision .mentor-table tr", { y: 14, stagger: 0.07, start: "top 78%" });
    reveal("#presentations", "#presentations .cv-list li", { y: 16, stagger: 0.045, start: "top 78%" });
    reveal("#posters", "#posters .cv-list li", { y: 16, stagger: 0.05, start: "top 78%" });
    reveal(".site-footer", ".site-footer", { y: 10, stagger: 0, duration: 0.5, start: "top 95%" });

    function revealPublications() {
      var items = gsap.utils.toArray("#publication-list .pub-item");
      var counter = document.getElementById("publication-count");
      if (items.length) {
        reveal("#publications", items, { y: 16, stagger: 0.04, start: "top 78%" });
      }
      if (counter && /^\d+$/.test(counter.textContent.trim())) {
        var total = parseInt(counter.textContent, 10);
        var counterObj = { n: 0 };
        var playCount = function () {
          gsap.to(counterObj, {
            n: total,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: function () {
              counter.textContent = String(Math.round(counterObj.n));
            }
          });
        };
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.create({
            trigger: "#publications",
            start: "top 80%",
            once: true,
            onEnter: playCount
          });
        } else {
          playCount();
        }
      }
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }

    var pubList = document.getElementById("publication-list");
    if (pubList) {
      if (pubList.getAttribute("aria-busy") === "false" && pubList.querySelector(".pub-item")) {
        revealPublications();
      }
      pubList.addEventListener("publications:loaded", revealPublications);
    }

    if (typeof ScrollTrigger !== "undefined") {
      sections.forEach(function (section) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 32%",
          end: "bottom 32%",
          onToggle: function (self) {
            if (!self.isActive) return;
            navLinks.forEach(function (link) {
              link.classList.toggle("is-active", link.getAttribute("href") === "#" + section.id);
            });
          }
        });
      });
    } else {
      bindFallbackNav();
    }

    if (typeof ScrollToPlugin !== "undefined") {
      navLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
          var href = link.getAttribute("href");
          if (!href || href.charAt(0) !== "#") return;
          var target = document.querySelector(href);
          if (!target) return;
          event.preventDefault();
          gsap.to(window, {
            duration: 0.85,
            ease: "power2.inOut",
            scrollTo: { y: target, offsetY: headerOffset(), autoKill: true },
            onComplete: function () {
              if (history.replaceState) history.replaceState(null, "", href);
            }
          });
        });
      });
    }

    return function () {
      document.documentElement.classList.remove("gs-ok");
      bindFallbackNav();
    };
  });
})();
