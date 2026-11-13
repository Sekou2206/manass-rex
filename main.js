(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const desk = window.matchMedia("(min-width:821px)").matches;
  const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const year = $(".year");
  if (year) year.textContent = new Date().getFullYear();

  const dark = $(".dark");
  let lx = .5, ly = .45, tx = .5, ty = .45, user = false, t = 0;
  if (fine) {
    dark.addEventListener("mousemove", e => {
      const r = dark.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; user = true;
    });
    dark.addEventListener("mouseleave", () => { user = false; });
  } else {
    dark.addEventListener("touchmove", e => {
      const r = dark.getBoundingClientRect(), p = e.touches[0];
      tx = (p.clientX - r.left) / r.width; ty = (p.clientY - r.top) / r.height; user = true;
    }, { passive: true });
    dark.addEventListener("touchend", () => { setTimeout(() => { user = false; }, 1200); });
  }
  const light = () => {
    t += reduce ? 0 : .006;
    if (!user) { tx = .5 + Math.sin(t * 1.3) * .32; ty = .42 + Math.sin(t * 2.1) * .18; }
    lx += (tx - lx) * .09; ly += (ty - ly) * .09;
    dark.style.setProperty("--x", (lx * 100).toFixed(2) + "%");
    dark.style.setProperty("--y", (ly * 100).toFixed(2) + "%");
    requestAnimationFrame(light);
  };
  light();

  const foot = $(".foot");
  if (foot && fine) foot.addEventListener("mousemove", e => {
    const r = foot.getBoundingClientRect();
    foot.style.setProperty("--fx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
  });

  const chips = $$(".chip");
  const figs = $$(".wall figure");
  chips.forEach(c => c.addEventListener("click", () => {
    chips.forEach(o => o.classList.toggle("is-on", o === c));
    const f = c.dataset.f;
    figs.forEach(fig => fig.classList.toggle("is-off", f !== "tout" && fig.dataset.c !== f));
  }));

  const ba = $(".ba");
  const range = $(".ba__range");
  const setP = v => ba.style.setProperty("--p", v + "%");
  range.addEventListener("input", () => setP(range.value));
  if (fine) ba.addEventListener("mousemove", e => {
    const r = ba.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    range.value = v; setP(v);
  });

  const flip = $(".flip");
  const toggle = $(".toggle");
  $$(".toggle button").forEach(b => b.addEventListener("click", () => {
    const v = b.dataset.v;
    flip.dataset.state = v;
    toggle.dataset.v = v;
    $$(".toggle button").forEach(o => o.classList.toggle("is-on", o === b));
  }));

  const verbs = $$(".verbs__list li");
  const frames = $$(".verbs__frames img");
  const setVerb = i => {
    verbs.forEach((v, k) => v.classList.toggle("is-on", k === i));
    frames.forEach((f, k) => f.classList.toggle("is-on", k === i));
  };

  if (!hasGsap || reduce) return;

  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView({ behavior: "smooth" });
  }));

  gsap.from(".dt__a,.dt__b", { yPercent: 60, opacity: 0, duration: 1.4, ease: "expo.out", stagger: .12, delay: .2 });
  gsap.from(".dark__tag,.dark__hint,.dark__loc", { opacity: 0, y: 14, duration: 1, ease: "expo.out", stagger: .1, delay: .7 });
  const rad = { v: 0 };
  const full = () => Math.max(150, Math.min(260, innerWidth * .17));
  gsap.to(rad, { v: 1, duration: 2.2, ease: "expo.out", delay: .1, onUpdate: () => dark.style.setProperty("--r", (full() * rad.v).toFixed(1) + "px") });
  gsap.to(".dark__title", { yPercent: -30, opacity: .2, ease: "none", scrollTrigger: { trigger: ".dark", start: "top top", end: "bottom top", scrub: true } });

  if (desk) {
    ScrollTrigger.create({
      trigger: ".verbs", start: "top top", end: "bottom bottom",
      onUpdate: s => setVerb(Math.min(2, Math.floor(s.progress * 3)))
    });
  }

  $$(".big,.proj__title").forEach(h => gsap.from(h, { yPercent: 40, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 90%" } }));
  gsap.from(".wall figure", { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .04, scrollTrigger: { trigger: ".wall", start: "top 85%" }, clearProps: "transform,opacity" });

  gsap.fromTo(".ba", { "--p": "92%" }, { "--p": "50%", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: ".ba", start: "top 70%" }, onComplete: () => { range.value = 50; } });

  $$(".setup").forEach(s => {
    gsap.from(s.querySelector(".setup__fig,.flip"), { clipPath: "inset(0 0 100% 0)", duration: 1.5, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 80%" } });
    gsap.from(s.querySelectorAll(".setup__txt>*"), { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: s, start: "top 75%" } });
  });

  $$(".lessons li").forEach(li => gsap.from(li, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 88%" } }));
  gsap.from(".rac__quote p", { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".rac__quote", start: "top 80%" } });

  if (desk) {
    gsap.to(".proj__float--a", { y: -120, rotate: -12, ease: "none", scrollTrigger: { trigger: ".proj", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".proj__float--b", { y: 120, rotate: 12, ease: "none", scrollTrigger: { trigger: ".proj", start: "top bottom", end: "bottom top", scrub: true } });
  }
  gsap.from(".svc li", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: .07, scrollTrigger: { trigger: ".svc", start: "top 85%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
