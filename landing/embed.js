/* Drop-in loader for the Two to Tango / Slice of Heaven landing page.
   Squarespace Code block (or any page):
     <div id="psrtd-mount"></div>
     <script src="https://cdn.jsdelivr.net/gh/rdrivel/dabs-stock@main/landing/embed.js"></script>
   On your own server, serve the landing/ folder and use index.html. */
(function () {
  var me = document.currentScript;
  var base = me.src.replace(/[^\/]*$/, "");
  var mount = document.getElementById("psrtd-mount");
  if (!mount) { mount = document.createElement("div"); me.parentNode.insertBefore(mount, me); }

  function loadMarkup() {
    fetch(base + "landing.html").then(function (r) { return r.text(); }).then(function (html) {
      mount.innerHTML = html;
      var s = document.createElement("script");
      s.src = base + "landing.js";
      s.setAttribute("data-base", base);
      document.body.appendChild(s);
    });
  }

  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = base + "landing.css";
  css.onload = loadMarkup;
  css.onerror = loadMarkup;
  document.head.appendChild(css);
})();
