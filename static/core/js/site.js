(function () {
  "use strict";

  // Header: denser background after scrolling
  var header = document.querySelector("[data-header]");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.querySelector("[data-burger]");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.hidden = !open;
    document.documentElement.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }
  if (burger) burger.addEventListener("click", function () { setMenu(menu.hidden); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1180) setMenu(false); });

  // Carousels: native scroll-snap + buttons, counter and progress
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector("[data-track]");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    var count = root.querySelector("[data-count]");
    var bar = root.querySelector("[data-progress]");
    if (!track) return;
    var items = track.children;

    function step() {
      var first = items[0];
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var perView = Math.max(1, Math.floor((track.clientWidth + gap) / (first.offsetWidth + gap)));
      return perView * (first.offsetWidth + gap);
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var ratio = max > 0 ? track.scrollLeft / max : 1;
      var first = items[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var w = first ? first.offsetWidth + gap : 1;
      var visible = Math.max(1, Math.floor((track.clientWidth + gap) / w));
      var idx = Math.min(items.length, Math.round(track.scrollLeft / w) + visible);
      if (count) count.textContent = idx + " / " + items.length;
      if (bar) bar.style.width = Math.max(8, Math.min(100, (visible / items.length) * 100 + ratio * (100 - (visible / items.length) * 100))) + "%";
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      var bars = root.querySelector(".carousel__bar");
      if (bars) bars.hidden = max <= 2;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  // Cursor follower: a ring trails the pointer (mouse/trackpad only)
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<div class="cursor__ring"></div>';
    document.body.appendChild(cursor);
    var mx = -100, my = -100, cx = -100, cy = -100, raf = null;
    function loop() {
      var k = still ? 1 : 0.2;
      cx += (mx - cx) * k; cy += (my - cy) * k;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      raf = Math.abs(mx - cx) + Math.abs(my - cy) > 0.1 ? requestAnimationFrame(loop) : null;
    }
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!cursor.classList.contains("is-visible")) { cx = mx; cy = my; cursor.classList.add("is-visible"); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", function () { cursor.classList.remove("is-visible"); });
    document.addEventListener("mouseenter", function () { cursor.classList.add("is-visible"); });
  }

  // Video player: opens RUTUBE / YouTube / VK embeds in a dialog
  var player = document.getElementById("player");
  if (player && player.showModal) {
    var frame = player.querySelector("[data-player-frame]");
    var close = function () { player.close(); };
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-video]");
      if (!btn) return;
      e.preventDefault();
      var src = btn.getAttribute("data-video");
      src += (src.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
      frame.innerHTML = '<iframe src="' + src.replace(/"/g, "&quot;") + '" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" allowfullscreen></iframe>';
      player.querySelector("[data-player-title]").textContent = btn.getAttribute("data-video-title") || "";
      player.querySelector("[data-player-link]").href = btn.getAttribute("data-video-link") || src;
      player.showModal();
    });
    player.querySelector("[data-player-close]").addEventListener("click", close);
    player.addEventListener("click", function (e) { if (e.target === player) close(); });
    player.addEventListener("close", function () { frame.innerHTML = ""; });
  }

  // Flash messages fade out
  var msgs = document.querySelector(".messages");
  if (msgs) setTimeout(function () { msgs.style.transition = "opacity .4s"; msgs.style.opacity = "0"; setTimeout(function () { msgs.remove(); }, 450); }, 5000);
})();
