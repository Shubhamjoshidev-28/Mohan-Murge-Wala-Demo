/*!
 * bridge-print.js  (v3 - WYSIWYG)
 *
 * Prints the REAL receipt HTML (same fonts, sizes, bold, layout, rupee sign,
 * QR code) on the thermal printer through the Thermal Bridge Android app.
 *
 *   receipt element -> clone -> apply the page's own @media print CSS
 *   -> html2canvas -> 1-bit bitmap -> ESC/POS raster (GS v 0)
 *   -> base64 -> POST http://127.0.0.1:9101/print  {"raw": "..."}
 *
 * Because the page's @media print rules are reused, anything you change in
 * style.css / bill.css print sections (sizes, padding, weight) is exactly
 * what comes out of the printer. No second copy of the layout to maintain.
 *
 * Load order on every receipt page:
 *   html2canvas.min.js  ->  bridge-print.js  ->  main.js
 *
 * Debug without wasting paper: add ?preview=1 to the receipt page URL.
 * The exact black/white bitmap is shown on screen instead of being printed.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------
  var BRIDGE_URL = "http://127.0.0.1:9101/print";

  // Printable width in dots. 58mm printer = 384, 80mm printer = 576
  // (some 80mm models use 512: try it if the print is cropped or shifted).
  var PAPER_DOTS = 384;

  // 0-255. Higher = darker print. Raise to ~190 if thin text looks broken.
  var THRESHOLD = 170;

  var STRIPE_ROWS = 128;   // rows per GS v 0 command (safer for printer buffers)
  var FEED_LINES = 4;      // blank lines after the receipt (for tear-off)
  var CUT = true;          // partial cut; ignored by printers with no cutter
  var TIMEOUT_MS = 30000;

  var WAIT_SCOPE_ID = "thermalCaptureHolder";

  // ---------------------------------------------------------------------
  // SMALL HELPERS
  // ---------------------------------------------------------------------
  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function bytesToBase64(u8) {
    var s = "";
    for (var i = 0; i < u8.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    }
    return btoa(s);
  }

  function isPreview() {
    try {
      return new URLSearchParams(window.location.search).get("preview") === "1";
    } catch (e) {
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // 1. PRINT CSS -> SCREEN CSS (scoped to the capture holder)
  //    html2canvas renders with SCREEN media, so the page's @media print
  //    rules would be ignored. We copy them out and scope them.
  // ---------------------------------------------------------------------
  function buildScopedPrintCss(scope) {
    var out = [];

    function collect(rules) {
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j];

        if (window.CSSMediaRule && rule instanceof CSSMediaRule) {
          if (/(^|[\s,])print([\s,]|$)/.test(rule.media.mediaText)) {
            for (var k = 0; k < rule.cssRules.length; k++) {
              var inner = rule.cssRules[k];
              if (!(window.CSSStyleRule && inner instanceof CSSStyleRule)) continue; // skips @page
              var selectors = inner.selectorText
                .split(",")
                .map(function (s) { return s.trim(); })
                .filter(function (s) { return s && !/^(html|body)\b/.test(s); })
                .map(function (s) { return scope + " " + s; });
              if (selectors.length) {
                out.push(selectors.join(",") + "{" + inner.style.cssText + "}");
              }
            }
          }
        }
      }
    }

    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules = null;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { rules = null; }
      if (rules) collect(rules);
    }
    return out.join("\n");
  }

  // ---------------------------------------------------------------------
  // 2. BUILD THE CLONE THAT WILL BE PHOTOGRAPHED
  // ---------------------------------------------------------------------
  function prepareClone(el, opts) {
    var clone = el.cloneNode(true);
    clone.removeAttribute("hidden");
    clone.hidden = false;

    // KOT pages: keep only the ticked items.
    if (opts && Array.isArray(opts.selectedIndexes)) {
      var rows = clone.querySelectorAll(".kot-select-item");
      Array.prototype.forEach.call(rows, function (row) {
        var cb = row.querySelector(".kot-select-checkbox");
        var idx = cb ? Number(cb.getAttribute("data-index")) : -1;
        if (opts.selectedIndexes.indexOf(idx) === -1) {
          row.parentNode.removeChild(row);
        }
      });
    }

    // Never print the on-screen selection checkboxes.
    var boxes = clone.querySelectorAll(".kot-select-checkbox");
    Array.prototype.forEach.call(boxes, function (b) { b.parentNode.removeChild(b); });

    return clone;
  }

  // ---------------------------------------------------------------------
  // 3. RENDER -> CANVAS
  // ---------------------------------------------------------------------
  function renderReceiptCanvas(el, opts, dots) {
    if (typeof window.html2canvas !== "function") {
      return Promise.reject(new Error("html2canvas is not loaded"));
    }

    var holder = document.createElement("div");
    holder.id = WAIT_SCOPE_ID;
    holder.style.cssText =
      "position:absolute;left:-10000px;top:0;background:#fff;margin:0;padding:0;";

    var style = document.createElement("style");
    style.textContent = buildScopedPrintCss("#" + WAIT_SCOPE_ID);
    holder.appendChild(style);

    var clone = prepareClone(el, opts);
    holder.appendChild(clone);
    document.body.appendChild(holder);

    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    return Promise.all([fontsReady, sleep(50)])
      .then(function () {
        var box = clone.getBoundingClientRect();
        var cssW = Math.max(1, box.width);
        var cssH = Math.max(1, box.height);
        if (cssH < 5) throw new Error("Receipt is empty");

        return window.html2canvas(clone, {
          scale: dots / cssW,          // output is ~dots pixels wide, no blur
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0
        });
      })
      .then(function (src) {
        // Exact dot width, white background.
        var w = dots;
        var h = Math.max(1, Math.round(src.height * (w / src.width)));
        var c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(src, 0, 0, w, h);
        return c;
      })
      .then(
        function (canvas) { holder.remove(); return canvas; },
        function (err) { holder.remove(); throw err; }
      );
  }

  // Threshold to black/white. Returns Uint8Array(w*h), 1 = print dot.
  function toBits(canvas) {
    var w = canvas.width;
    var h = canvas.height;
    var px = canvas.getContext("2d").getImageData(0, 0, w, h).data;
    var bits = new Uint8Array(w * h);
    for (var i = 0, p = 0; i < bits.length; i++, p += 4) {
      var lum = 0.299 * px[p] + 0.587 * px[p + 1] + 0.114 * px[p + 2];
      bits[i] = lum < THRESHOLD ? 1 : 0;
    }
    return bits;
  }

  // ---------------------------------------------------------------------
  // 4. BITS -> ESC/POS RASTER
  // ---------------------------------------------------------------------
  function bitsToEscPos(bits, w, h) {
    var bytesPerRow = w >> 3;       // w must be a multiple of 8
    var out = [];

    out.push(0x1B, 0x40);           // ESC @   initialise
    out.push(0x1B, 0x61, 0x00);     // ESC a 0 left align

    for (var y0 = 0; y0 < h; y0 += STRIPE_ROWS) {
      var rows = Math.min(STRIPE_ROWS, h - y0);
      out.push(
        0x1D, 0x76, 0x30, 0x00,     // GS v 0  (normal density)
        bytesPerRow & 255, bytesPerRow >> 8,
        rows & 255, rows >> 8
      );
      for (var y = y0; y < y0 + rows; y++) {
        var base = y * w;
        for (var xb = 0; xb < bytesPerRow; xb++) {
          var b = 0;
          var o = base + (xb << 3);
          for (var bit = 0; bit < 8; bit++) {
            if (bits[o + bit]) b |= (0x80 >> bit);
          }
          out.push(b);
        }
      }
    }

    out.push(0x1B, 0x64, FEED_LINES);             // ESC d n  feed
    if (CUT) out.push(0x1D, 0x56, 0x42, 0x00);    // GS V 66 0 partial cut
    return new Uint8Array(out);
  }

  // ---------------------------------------------------------------------
  // 5. SEND TO THE BRIDGE APP
  // ---------------------------------------------------------------------
  function postToBridge(payload) {
    var ctrl = (typeof AbortController === "function") ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;

    return fetch(BRIDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) { return res.json(); })
      .then(function (out) {
        if (!out || !out.ok) throw new Error((out && out.error) || "Print failed");
        return out;
      })
      .then(
        function (v) { if (timer) clearTimeout(timer); return v; },
        function (e) { if (timer) clearTimeout(timer); throw e; }
      );
  }

  function bridgeHint(err) {
    return "Could not print: " + (err && err.message ? err.message : err) +
      "\n\nOpen the Thermal Bridge app and tap Start bridge.";
  }

  // ---------------------------------------------------------------------
  // 6. PREVIEW OVERLAY (?preview=1)
  // ---------------------------------------------------------------------
  function showPreview(canvas) {
    var old = document.getElementById("bridgePreviewOverlay");
    if (old) old.remove();

    var overlay = document.createElement("div");
    overlay.id = "bridgePreviewOverlay";
    overlay.style.cssText =
      "position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,.75);" +
      "overflow:auto;padding:16px;text-align:center;";

    var note = document.createElement("div");
    note.textContent = "Exact print preview (" + canvas.width + " x " + canvas.height +
      " dots). Tap to close.";
    note.style.cssText = "color:#fff;font:14px sans-serif;margin-bottom:10px;";

    var shown = document.createElement("canvas");
    shown.width = canvas.width;
    shown.height = canvas.height;
    var ctx = shown.getContext("2d");
    var src = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    var d = src.data;
    for (var i = 0; i < d.length; i += 4) {
      var lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      var v = lum < THRESHOLD ? 0 : 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(src, 0, 0);
    shown.style.cssText = "background:#fff;max-width:100%;image-rendering:pixelated;";

    overlay.appendChild(note);
    overlay.appendChild(shown);
    overlay.onclick = function () { overlay.remove(); };
    document.body.appendChild(overlay);
  }

  // ---------------------------------------------------------------------
  // 7. PUBLIC: print a receipt element exactly as it looks
  //    opts.selectedIndexes  - KOT: indexes of ticked items to keep
  //    opts.fallbackText     - function returning plain text, used only if
  //                            the image could not be built
  //    opts.dots             - override paper width in dots
  //    Always resolves (true = sent, false = failed); alerts on failure.
  // ---------------------------------------------------------------------
  function printReceipt(el, opts) {
    opts = opts || {};
    var dots = opts.dots || PAPER_DOTS;
    dots = dots - (dots % 8);

    if (!el) {
      alert("Nothing to print: receipt element not found.");
      return Promise.resolve(false);
    }

    return renderReceiptCanvas(el, opts, dots)
      .then(
        function (canvas) {
          if (isPreview()) {
            showPreview(canvas);
            return true;
          }
          var bits = toBits(canvas);
          var bytes = bitsToEscPos(bits, canvas.width, canvas.height);
          return postToBridge({ raw: bytesToBase64(bytes) }).then(
            function () { return true; },
            function (err) {
              console.error("BridgePrint:", err);
              alert(bridgeHint(err));
              return false;
            }
          );
        },
        function (err) {
          // Could not build the image: fall back to the old plain-text path.
          console.error("BridgePrint image render failed:", err);
          if (typeof opts.fallbackText === "function") {
            return printText(opts.fallbackText());
          }
          alert("Could not build the receipt image: " + (err && err.message ? err.message : err));
          return false;
        }
      );
  }

  // ---------------------------------------------------------------------
  // 8. OLD PLAIN-TEXT PATH (kept as fallback)
  // ---------------------------------------------------------------------
  var WIDTH = 32;                                   // characters per line (58mm)
  var DASH = new Array(WIDTH + 1).join("-");

  function spaces(n) { return new Array(Math.max(0, n) + 1).join(" "); }

  function center(text) {
    text = String(text);
    return spaces(Math.floor((WIDTH - text.length) / 2)) + text;
  }

  function wrap(text, width) {
    var words = String(text).split(" ");
    var lines = [];
    var cur = "";
    words.forEach(function (w) {
      while (w.length > width) {
        if (cur) { lines.push(cur); cur = ""; }
        lines.push(w.slice(0, width));
        w = w.slice(width);
      }
      if (!cur) cur = w;
      else if ((cur + " " + w).length <= width) cur += " " + w;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }

  function row(left, right) {
    right = String(right);
    var lines = wrap(left, Math.max(4, WIDTH - right.length - 1));
    lines[0] = lines[0] + spaces(WIDTH - lines[0].length - right.length) + right;
    return lines;
  }

  function label(it) {
    return it.name + (it.portion && it.portion !== "Regular" ? " (" + it.portion + ")" : "");
  }

  function num(n) { return String(Math.round(Number(n) || 0)); }

  function buildKot(order, items) {
    var lines = [center("KOT"), ""];
    lines = lines.concat(row("TABLE", order.tableNumber));
    lines.push(DASH);
    lines = lines.concat(row("ITEM", "QTY"));
    items.forEach(function (it) {
      lines = lines.concat(row(label(it), "x" + it.quantity));
    });
    lines.push(DASH);
    return lines.join("\n");
  }

  function buildBill(order, items, restaurantName, timeText) {
    var lines = [center(restaurantName), ""];
    lines.push("Table: " + order.tableNumber);
    lines.push("Order #" + order.id.slice(-6).toUpperCase());
    if (timeText) lines.push(timeText);
    lines.push(DASH);
    var total = 0;
    items.forEach(function (it) {
      var sub = it.price * it.quantity;
      total += sub;
      lines = lines.concat(wrap(label(it), WIDTH));
      lines = lines.concat(row("  " + it.quantity + " x " + num(it.price), num(sub)));
    });
    lines.push(DASH);
    lines = lines.concat(row("TOTAL", "Rs " + num(total)));
    lines.push("");
    lines.push(center("Thank you!"));
    return lines.join("\n");
  }

  function printText(text) {
    return postToBridge({ text: text + "\n", feed: 3, cut: true })
      .then(function () { return true; })
      .catch(function (err) {
        console.error("BridgePrint:", err);
        alert(bridgeHint(err));
        return false;
      });
  }

  window.BridgePrint = {
    printReceipt: printReceipt,
    print: printText,          // old name, plain text
    buildKot: buildKot,
    buildBill: buildBill
  };
})();
