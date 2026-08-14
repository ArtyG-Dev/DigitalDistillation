/* Digital Distillation — application logic.
   Security posture (see README):
     - no innerHTML, no eval/Function, no inline handlers, no third-party requests
     - every node built with createElement + textContent, so no string ever reaches a parser
     - URL hash is untrusted input: author/subject/keyword are allow-listed against the
       corpus, and the free-text query is length-capped and only ever used for matching
     - no storage APIs; all state lives in memory and in the URL */
(function () {
  "use strict";

  var AUTHORS = window.DD_AUTHORS || [];
  var ENTRIES = window.DD_ENTRIES || [];
  var ERAS = window.DD_ERAS || [];
  var Q_MAX = 64;
  var SIZES = { s: "", l: "text-l", xl: "text-xl" };

  var byId = {};
  AUTHORS.forEach(function (a) { byId[a.id] = a; });

  var VALID_AU = new Set(AUTHORS.map(function (a) { return a.id; }));
  var VALID_S = new Set(ENTRIES.map(function (e) { return e.s; }));
  var VALID_K = new Set(ENTRIES.reduce(function (acc, e) { return acc.concat(e.k); }, []));
  var VALID_E = new Set(ENTRIES.map(function (e) { return e.id; }));

  /* Saved entries live in memory and in the URL (?f=), never in storage — see README.
     The address bar is the persistence layer: bookmark it and the list comes back. */
  var state = { au: "", s: "", k: "", q: "", size: "s", f: [], fo: false };
  var featured = ENTRIES[0];
  var HIVOL_MIN = 10; // an author with more entries than this is highlighted as high-volume
  var openEras = {};  // era name -> whether its collapsible tab group is expanded

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* Every entry is an original wording, never a quotation. The marker rides on the
     author name so the signal travels with deep-linked and shared entries. */
  function distilMark() {
    var a = el("a", "distil-mark");
    a.href = "#sourcing";
    a.setAttribute("aria-label", "Distilled — an original wording, not a quotation. See sourcing note.");
    a.title = "Distilled — an original wording, not a quotation.";
    var s = el("sup", null, "D");
    s.setAttribute("aria-hidden", "true");
    a.appendChild(s);
    return a;
  }

  function whoName(name) {
    var w = el("span", "who", name);
    w.appendChild(distilMark());
    return w;
  }

  function distilKey() {
    var p = el("p", "distil-key");
    var s = el("span", null, "D");
    s.setAttribute("aria-hidden", "true");
    p.appendChild(s);
    p.appendChild(document.createTextNode(" Distilled — original wording, not a quotation."));
    return p;
  }

  function isSaved(id) { return state.f.indexOf(id) !== -1; }

  function saveButton(id) {
    var on = isSaved(id);
    var b = el("button", "fav");
    b.type = "button";
    b.dataset.fav = id;
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Saved — remove from your saved quotes" : "Save this quote");
    b.appendChild(el("span", "heart", on ? "♥" : "♡"));
    b.appendChild(el("span", null, on ? "Saved" : "Save"));
    return b;
  }

  /* ---------- selection ---------- */

  function pool() {
    return state.au ? ENTRIES.filter(function (e) { return e.au === state.au; }) : ENTRIES;
  }

  function dayIndex() {
    var d = new Date();
    return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  }

  function pickForToday() {
    var p = pool();
    return p.length ? p[dayIndex() % p.length] : null;
  }

  function pickRandom() {
    var p = pool();
    if (p.length < 2) return p[0] || null;
    var next;
    do { next = p[Math.floor(Math.random() * p.length)]; } while (next === featured);
    return next;
  }

  /* ---------- rendering ---------- */

  function entryCount(auId) {
    return ENTRIES.filter(function (e) { return e.au === auId; }).length;
  }

  function currentEra() {
    var auId = state.au || (featured && featured.au);
    var a = auId ? byId[auId] : null;
    return a ? a.era : null;
  }

  function paintFeatured() {
    var host = $("featured");
    clear(host);
    if (!featured) return;
    var au = byId[featured.au];
    var hivol = entryCount(featured.au) > HIVOL_MIN;
    var cls = "featured a-" + featured.au;
    if (au.era === "Diaspora thought" || au.kente) cls += " kente";
    if (hivol) cls += " hivol";
    host.className = cls;

    var head = el("div", "featured-head");
    head.appendChild(whoName(au.name));
    head.appendChild(el("span", null, featured.s));
    if (hivol) {
      var badge = el("span", "badge", "Extensive");
      badge.title = "More than " + HIVOL_MIN + " entries from this thinker";
      head.appendChild(badge);
    }
    head.appendChild(el("span", "grow"));
    head.appendChild(saveButton(featured.id));
    head.appendChild(el("span", null, featured.id));
    host.appendChild(head);

    var q = el("blockquote", null, featured.a);
    q.id = "featured-text";
    host.appendChild(q);

    var pr = el("p", "prac");
    pr.appendChild(el("b", null, "The practice"));
    pr.appendChild(el("span", null, featured.p));
    host.appendChild(pr);

    host.appendChild(el("p", "attrib", featured.src + "  \u00b7  " + au.years));
    host.appendChild(distilKey());
  }

  function paintTabs() {
    var host = $("tabs");
    clear(host);

    var allRow = el("div", "tab-group");
    var allWrap = el("div", "tab-row");
    var all = el("button", "tab");
    all.type = "button";
    all.dataset.au = "";
    all.setAttribute("aria-pressed", String(state.au === ""));
    all.appendChild(el("span", null, "All thinkers"));
    all.appendChild(el("span", "c", ENTRIES.length));
    allWrap.appendChild(all);
    allRow.appendChild(allWrap);
    host.appendChild(allRow);

    var curEra = currentEra();

    ERAS.forEach(function (era) {
      var members = AUTHORS.filter(function (a) {
        return a.era === era && ENTRIES.some(function (e) { return e.au === a.id; });
      });
      if (!members.length) return;

      if (!Object.prototype.hasOwnProperty.call(openEras, era)) {
        openEras[era] = era === curEra;
      }

      var group = el("details", "tab-group era-group");
      group.open = openEras[era];
      group.addEventListener("toggle", function () { openEras[era] = group.open; });

      var summary = el("summary", null);
      summary.appendChild(el("h3", null, era));
      group.appendChild(summary);

      var row = el("div", "tab-row");
      members.forEach(function (a) {
        var n = entryCount(a.id);
        var hivol = n > HIVOL_MIN;
        var b = el("button", "tab a-" + a.id + (hivol ? " tab-hivol" : ""));
        b.type = "button";
        b.dataset.au = a.id;
        b.title = a.name + " (" + a.years + ") \u2014 " + a.note;
        b.setAttribute("aria-pressed", String(state.au === a.id));
        b.appendChild(el("span", null, a.name));
        b.appendChild(el("span", "c", n));
        if (hivol) {
          var badge = el("span", "badge", "More");
          badge.title = "More than " + HIVOL_MIN + " entries";
          b.appendChild(badge);
        }
        row.appendChild(b);
      });
      group.appendChild(row);
      host.appendChild(group);
    });
  }

  function paintSide() {
    var p = pool();

    var subjects = [];
    p.forEach(function (e) { if (subjects.indexOf(e.s) === -1) subjects.push(e.s); });
    var sHost = $("subjects");
    clear(sHost);
    subjects.forEach(function (s) {
      var li = el("li");
      var b = el("button", "pick");
      b.type = "button";
      b.dataset.s = s;
      b.setAttribute("aria-pressed", String(state.s === s));
      b.appendChild(el("span", "nm", s));
      b.appendChild(el("span", "n", p.filter(function (e) { return e.s === s; }).length));
      li.appendChild(b);
      sHost.appendChild(li);
    });

    var kws = [];
    p.forEach(function (e) { e.k.forEach(function (k) { if (kws.indexOf(k) === -1) kws.push(k); }); });
    kws.sort(function (a, b) { return a.localeCompare(b); });
    var kHost = $("keywords");
    clear(kHost);
    kws.forEach(function (k) {
      var b = el("button", "kw", k);
      b.type = "button";
      b.dataset.k = k;
      b.setAttribute("aria-pressed", String(state.k === k));
      kHost.appendChild(b);
    });
  }

  function matches(e) {
    if (state.fo && !isSaved(e.id)) return false;
    if (state.au && e.au !== state.au) return false;
    if (state.s && e.s !== state.s) return false;
    if (state.k && e.k.indexOf(state.k) === -1) return false;
    if (state.q) {
      var hay = (e.a + " " + e.p + " " + e.s + " " + e.k.join(" ") + " " + e.src + " " +
                 (byId[e.au] ? byId[e.au].name : "")).toLowerCase();
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  function entryNode(e) {
    var au = byId[e.au];
    var li = el("li", "entry a-" + e.au);
    li.id = e.id;

    var meta = el("div", "meta");
    meta.appendChild(whoName(au.name));
    meta.appendChild(el("span", null, e.s));
    meta.appendChild(el("span", null, e.id));
    li.appendChild(meta);

    li.appendChild(el("p", "aff", e.a));

    var pr = el("p", "prac");
    pr.appendChild(el("b", null, "The practice"));
    pr.appendChild(el("span", null, e.p));
    li.appendChild(pr);

    var foot = el("div", "foot");
    foot.appendChild(el("span", "src", e.src));
    e.k.forEach(function (k) {
      var b = el("button", "kw", k);
      b.type = "button";
      b.dataset.k = k;
      b.setAttribute("aria-pressed", String(state.k === k));
      foot.appendChild(b);
    });
    foot.appendChild(saveButton(e.id));
    var cp = el("button", "btn", "Copy");
    cp.type = "button";
    cp.dataset.copy = e.id;
    foot.appendChild(cp);
    li.appendChild(foot);
    li.appendChild(distilKey());
    return li;
  }

  function render() {
    var list = ENTRIES.filter(matches);
    var host = $("entries");
    clear(host);
    var frag = document.createDocumentFragment();
    list.forEach(function (e) { frag.appendChild(entryNode(e)); });
    host.appendChild(frag);

    $("empty").hidden = list.length > 0;
    $("count").textContent = list.length + (list.length === 1 ? " entry" : " entries");

    var saved = $("saved");
    saved.setAttribute("aria-pressed", String(state.fo));
    saved.textContent = "Saved (" + state.f.length + ")";

    var bits = [];
    if (state.fo) bits.push("saved only");
    if (state.au) bits.push("thinker: " + byId[state.au].name);
    if (state.s) bits.push("subject: " + state.s);
    if (state.k) bits.push("keyword: " + state.k);
    if (state.q) bits.push('search: "' + state.q + '"');
    $("scope").textContent = bits.join("  \u00b7  ");
    $("clear").hidden = bits.length === 0;

    document.body.className = SIZES[state.size] || "";
    document.documentElement.className = state.au ? "a-" + state.au : "";

    Array.prototype.forEach.call(document.querySelectorAll(".sizer button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.size === state.size));
    });
  }

  function paintAll() { paintTabs(); paintSide(); render(); }

  /* ---------- URL as address ---------- */

  function writeHash() {
    var p = new URLSearchParams();
    if (state.au) p.set("a", state.au);
    if (state.s) p.set("s", state.s);
    if (state.k) p.set("k", state.k);
    if (state.q) p.set("q", state.q);
    if (state.size !== "s") p.set("t", state.size);
    if (state.f.length) p.set("f", state.f.join("."));
    if (state.fo) p.set("fo", "1");
    var h = p.toString();
    history.replaceState(null, "", h ? "#" + h : location.pathname + location.search);
  }

  function readHash() {
    var raw = location.hash.slice(1);
    if (!raw) return;
    var p;
    try { p = new URLSearchParams(raw); } catch (err) { return; }

    var a = p.get("a"); if (a && VALID_AU.has(a)) state.au = a;
    var s = p.get("s"); if (s && VALID_S.has(s)) state.s = s;
    var k = p.get("k"); if (k && VALID_K.has(k)) state.k = k;
    var t = p.get("t"); if (t && Object.prototype.hasOwnProperty.call(SIZES, t)) state.size = t;

    var q = p.get("q");
    if (q) { state.q = q.slice(0, Q_MAX).replace(/[^\p{L}\p{N}\s'\-]/gu, "").trim(); }

    var f = p.get("f");
    if (f) {
      f.split(".").forEach(function (id) {
        if (VALID_E.has(id) && !isSaved(id)) state.f.push(id);
      });
    }
    if (p.get("fo") === "1") state.fo = true;

    var e = p.get("e");
    if (e) {
      var hit = ENTRIES.filter(function (x) { return x.id === e; })[0];
      if (hit) { featured = hit; state.au = hit.au; }
    }
  }

  function sync() { paintAll(); writeHash(); }

  /* ---------- events ---------- */

  $("tabs").addEventListener("click", function (ev) {
    var b = ev.target.closest(".tab");
    if (!b) return;
    var next = b.dataset.au;
    state.au = state.au === next ? "" : next;
    state.s = ""; state.k = "";
    featured = pickForToday();
    paintFeatured();
    sync();
  });

  $("subjects").addEventListener("click", function (ev) {
    var b = ev.target.closest(".pick");
    if (!b) return;
    state.s = state.s === b.dataset.s ? "" : b.dataset.s;
    sync();
  });

  function saveHandler(ev) {
    var b = ev.target.closest(".fav");
    if (!b) return false;
    var i = state.f.indexOf(b.dataset.fav);
    if (i === -1) state.f.push(b.dataset.fav); else state.f.splice(i, 1);
    paintFeatured();
    sync();
    return true;
  }
  $("featured").addEventListener("click", saveHandler);

  $("saved").addEventListener("click", function () {
    state.fo = !state.fo;
    sync();
  });

  function keywordHandler(ev) {
    var b = ev.target.closest(".kw");
    if (!b) return false;
    state.k = state.k === b.dataset.k ? "" : b.dataset.k;
    sync();
    return true;
  }
  $("keywords").addEventListener("click", keywordHandler);

  $("entries").addEventListener("click", function (ev) {
    if (saveHandler(ev)) return;
    if (keywordHandler(ev)) return;
    var cp = ev.target.closest("[data-copy]");
    if (!cp) return;
    var hit = ENTRIES.filter(function (x) { return x.id === cp.dataset.copy; })[0];
    if (!hit) return;
    var text = hit.a + "\n\n\u2014 " + hit.src;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        cp.textContent = "Copied";
        setTimeout(function () { cp.textContent = "Copy"; }, 1400);
      }, function () { cp.textContent = "Select it"; });
    } else {
      cp.textContent = "Select it";
    }
  });

  $("q").addEventListener("input", function (ev) {
    state.q = ev.target.value.slice(0, Q_MAX).trim();
    render();
    writeHash();
  });

  $("clear").addEventListener("click", function () {
    state.s = ""; state.k = ""; state.q = ""; state.fo = false;
    $("q").value = "";
    sync();
  });

  $("shuffle").addEventListener("click", function () {
    featured = pickRandom();
    paintFeatured();
  });

  $("sizer").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-size]");
    if (!b) return;
    state.size = b.dataset.size;
    render();
    writeHash();
  });

  /* ---------- boot ---------- */

  featured = pickForToday();
  readHash();
  if (!featured || (state.au && featured.au !== state.au)) featured = pickForToday();
  $("q").value = state.q;
  $("q").maxLength = Q_MAX;
  paintFeatured();
  paintAll();
})();
