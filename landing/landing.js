/* Proverbial Spirits: Two to Tango + Slice of Heaven store finder.
   Loaded by embed.js after landing.html is in the page. */
(function () {
  var BASE = (document.currentScript && document.currentScript.getAttribute("data-base")) || "";
  var DATA_URL = "https://raw.githubusercontent.com/rdrivel/dabs-stock/main/stores.json";

  var root = document.getElementById("psrtd");
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };

  // Can images live in the repo next to this file.
  var CAN_IMG = { tango: BASE + "img/two-to-tango-can.webp", slice: BASE + "img/slice-of-heaven-can.webp" };
  root.querySelectorAll("img[data-can]").forEach(function (i) { i.src = CAN_IMG[i.getAttribute("data-can")]; });

  // Built-in fallback, used until stores.json loads (or if it can't).
  var STOCK_DATE = "November 4, 2026";
  // id, address, city, phone, lat, lng, Two to Tango qty (931895), Slice of Heaven qty (931896)
  var STORES = [
    ["0001", "151 East 300 South", "Salt Lake City", "801-533-5901", 40.760328, -111.897375, 3, 10],
    ["0004", "1615 S Foothill Dr", "Salt Lake City", "801-584-8387", 40.739595, -111.82617, 36, 41],
    ["0018", "1580 S Providence Center Dr", "Cedar City", "435-586-1644", 37.650727, -113.086541, 20, null],
    ["0023", "3656 W 5600 S", "Roy", "801-825-8755", 41.16254, -112.06948, 45, 44],
    ["0026", "3905 W 5400 S", "Kearns", "801-968-9826", 40.653102, -111.984305, 15, null],
    ["0027", "963 S Main St", "Moab", "435-259-5314", 38.558878, -109.54687, 48, 0],
    ["0039", "161 N 900 E", "St. George", "435-674-9550", 37.111093, -113.564253, 8, 24],
    ["0040", "13332 S Market Center Dr", "Riverton", "801-253-5807", 40.509256, -111.981285, 13, null],
    ["0043", "262 E Gateway Dr", "Heber City", "435-657-3088", 40.492073, -111.409652, 29, null],
    ["0046", "6262 S 5600 W", "West Valley City", "801-685-4110", 40.637251, -112.02588, 8, null],
    ["0048", "5278 W Anthem Peak Ln", "Herriman", "385-484-7255", 40.535684, -112.0176, 8, null],
    ["0051", "4455 S 2700 W", "Taylorsville", "801-955-2100", 40.673462, -111.957851, 60, 56],
    ["0052", "1880 E 9400 S", "Sandy", "801-253-5760", 40.580098, -111.839075, 62, 52],
    ["0053", "1115 W 12th St", "Marriott-Slaterville", "801-629-5880", 41.244428, -112.006896, null, 56]
  ].map(function (r) {
    return { id: r[0], name: "State Liquor Store #" + parseInt(r[0], 10), addr: r[1], city: r[2], phone: r[3], lat: r[4], lng: r[5], tango: r[6], slice: r[7] };
  });

  var CITIES = [
    ["Park City", 40.6461, -111.4980], ["Salt Lake City", 40.7608, -111.8910], ["Heber City", 40.5070, -111.4130], ["Kamas", 40.6430, -111.2807],
    ["Midway", 40.5122, -111.4743], ["Ogden", 41.2230, -111.9738], ["Layton", 41.0602, -111.9711], ["Bountiful", 40.8894, -111.8808],
    ["Sandy", 40.5649, -111.8389], ["Draper", 40.5247, -111.8638], ["West Jordan", 40.6097, -111.9391], ["Lehi", 40.3916, -111.8508],
    ["Orem", 40.2969, -111.6946], ["Provo", 40.2338, -111.6585], ["Spanish Fork", 40.1150, -111.6549], ["Tooele", 40.5308, -112.2983],
    ["Logan", 41.7370, -111.8338], ["Brigham City", 41.5102, -112.0155], ["Vernal", 40.4555, -109.5287], ["Price", 39.5994, -110.8107],
    ["Moab", 38.5733, -109.5498], ["Richfield", 38.7725, -112.0841], ["Cedar City", 37.6775, -113.0619], ["St. George", 37.0965, -113.5684]
  ];

  var state = { filter: "any", origin: { lat: 40.6461, lng: -111.4980, label: "Park City", exact: false, kind: "city" } };
  var isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;

  $("ps-date").textContent = STOCK_DATE;
  CITIES.forEach(function (c, i) { var o = document.createElement("option"); o.value = i; o.textContent = c[0]; $("ps-city").appendChild(o); });

  function track(name, params) { try { if (window.gtag) window.gtag("event", name, params || {}); } catch (e) {} }
  function miles(a, b) {
    var R = 3958.8, t = Math.PI / 180, dLa = (b.lat - a.lat) * t, dLo = (b.lng - a.lng) * t;
    var h = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmt(mi) { return mi < 10 ? mi.toFixed(1) : Math.round(mi).toString(); }
  function has(q) { return q != null && q > 0; }
  function matches(s) {
    var f = state.filter;
    if (f === "tango") return has(s.tango);
    if (f === "slice") return has(s.slice);
    if (f === "both") return has(s.tango) && has(s.slice);
    return has(s.tango) || has(s.slice);
  }
  function dirURL(s) {
    var d = s.lat + "," + s.lng, o = state.origin;
    if (isApple) return "https://maps.apple.com/?daddr=" + d + (o.exact ? "&saddr=" + o.lat + "," + o.lng : "");
    return "https://www.google.com/maps/dir/?api=1&destination=" + d + (o.exact ? "&origin=" + o.lat + "," + o.lng : "");
  }
  function pill(cls, label, q) {
    if (q == null) return "";
    var c = q === 0 ? " out" : (q < 6 ? " low" : "");
    return '<span class="ps-pill ' + cls + c + '">' + label + "</span>";
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function render() {
    var list = STORES.filter(matches).map(function (s) { return { s: s, d: miles(state.origin, s) }; }).sort(function (a, b) { return a.d - b.d; });
    var near = $("ps-nearest"), ul = $("ps-list");
    if (!list.length) {
      near.hidden = true;
      ul.innerHTML = '<li class="ps-store"><h4>No store carries both right now.</h4><p class="ps-addr">Try "Either can" to see every store with stock.</p></li>';
      return;
    }
    near.hidden = false;
    var s = list[0].s;
    var cans = [has(s.tango) ? "Two to Tango" : null, has(s.slice) ? "Slice of Heaven" : null].filter(Boolean).join(" + ");
    near.innerHTML =
      '<div><p class="ps-eyebrow">Closest to ' + esc(state.origin.label) + "</p>" +
      "<h3>" + esc(s.name) + ", " + esc(s.city) + "</h3>" +
      "<p>" + esc(s.addr) + ", " + esc(s.city) + ", UT · " + esc(s.phone) + "</p>" +
      '<p style="margin-top:6px;font-weight:700">Stocks: ' + esc(cans) + "</p></div>" +
      '<div class="ps-dist">' + fmt(list[0].d) + "<small>miles away</small></div>" +
      '<div class="ps-actions"><a class="ps-btn" data-sid="' + s.id + '" data-pos="nearest" href="' + dirURL(s) + '" target="_blank" rel="noopener">Get directions</a>' +
      '<a class="ps-ghost" data-sid="' + s.id + '" data-pos="nearest" href="tel:' + s.phone.replace(/\D/g, "") + '">Call the store</a></div>';
    ul.innerHTML = list.slice(1).map(function (n) {
      var s = n.s;
      return '<li class="ps-store"><h4>' + esc(s.city) + '</h4><span class="ps-km">' + fmt(n.d) + " mi</span>" +
        '<p class="ps-addr">' + esc(s.name) + " · " + esc(s.addr) + " · " + esc(s.phone) + "</p>" +
        '<div class="ps-row">' + pill("tango", "Two to Tango", s.tango) + pill("slice", "Slice of Heaven", s.slice) +
        '<span class="ps-links"><a class="ps-dir" data-sid="' + s.id + '" data-pos="list" href="' + dirURL(s) + '" target="_blank" rel="noopener">Directions</a></span></div></li>';
    }).join("");
  }

  function setOrigin(lat, lng, label, exact, kind, msg) {
    state.origin = { lat: lat, lng: lng, label: label, exact: !!exact, kind: kind };
    $("ps-status").textContent = msg || "";
    render();
  }

  // Google Analytics events (gtag comes from Squarespace's GA setting).
  root.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-sid]");
    if (a) {
      var s = STORES.filter(function (x) { return x.id === a.getAttribute("data-sid"); })[0] || {};
      track(a.classList.contains("ps-ghost") ? "call_store" : "get_directions", {
        store_id: s.id, store_name: s.name, store_city: s.city,
        list_position: a.getAttribute("data-pos"), origin_type: state.origin.kind,
        origin_city: state.origin.kind === "city" ? state.origin.label : "", can_filter: state.filter
      });
      return;
    }
    if (e.target.closest && e.target.closest('a[href="#ps-finder"]')) track("find_a_can_click", {});
  });

  root.querySelectorAll(".ps-chip").forEach(function (b) {
    b.addEventListener("click", function () {
      root.querySelectorAll(".ps-chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      state.filter = b.getAttribute("data-f");
      render();
      track("can_filter", { can_filter: state.filter });
    });
  });

  $("ps-city").addEventListener("change", function (e) {
    var c = CITIES[+e.target.value];
    setOrigin(c[1], c[2], c[0], false, "city");
    track("choose_city", { city: c[0] });
  });

  $("ps-locate").addEventListener("click", function () {
    if (!navigator.geolocation) { $("ps-status").textContent = "Your browser doesn't share location. Pick a city or enter a ZIP instead."; return; }
    $("ps-status").textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(function (p) {
      setOrigin(p.coords.latitude, p.coords.longitude, "you", true, "my_location", "Sorted by distance from where you are now.");
      track("use_location", { result: "shared" });
    }, function () {
      $("ps-status").textContent = "Location is blocked or unavailable. Pick a city or enter a ZIP instead.";
      track("use_location", { result: "blocked" });
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });

  $("ps-zipform").addEventListener("submit", function (e) {
    e.preventDefault();
    var z = $("ps-zip").value.trim();
    if (!/^\d{5}$/.test(z)) { $("ps-status").textContent = "Enter a 5-digit ZIP code."; return; }
    $("ps-status").textContent = "Looking up " + z + "…";
    fetch("https://api.zippopotam.us/us/" + z).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      var pl = j.places[0];
      setOrigin(+pl.latitude, +pl.longitude, pl["place name"] + " " + z, true, "zip", "Sorted by distance from " + pl["place name"] + ", " + pl["state abbreviation"] + ".");
      track("zip_lookup", { result: "found" });
    }).catch(function () {
      track("zip_lookup", { result: "not_found" });
      $("ps-status").textContent = "We couldn't look up that ZIP. Pick the nearest city from the list instead.";
    });
  });

  render();

  // Daily stock from the GitHub Action.
  fetch(DATA_URL, { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
    if (!d || !d.stores || !d.stores.length) return;
    STORES = d.stores.map(function (s) {
      return { id: s.id, name: s.name, addr: s.addr, city: s.city, phone: s.phone, lat: +s.lat, lng: +s.lng, tango: s.tango, slice: s.slice };
    });
    var dt = new Date(d.updated);
    if (!isNaN(dt)) $("ps-date").textContent = dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Denver" });
    render();
  }).catch(function () {});
})();
