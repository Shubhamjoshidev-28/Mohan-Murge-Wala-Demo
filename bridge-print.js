/*!
 * bridge-print.js
 * Formats KOT / bill receipts as plain text and sends them to the
 * Thermal Bridge Android app (http://127.0.0.1:9101/print).
 *
 * Load this BEFORE main.js on every receipt page.
 */
(function () {
  "use strict";

  var BRIDGE_URL = "http://127.0.0.1:9101/print";

  // Characters per line. 58mm paper = 32, 80mm paper = 42 or 48 (test and adjust).
  var WIDTH = 32;

  var DASH = new Array(WIDTH + 1).join("-");

  function spaces(n) { return new Array(Math.max(0, n) + 1).join(" "); }

  function center(text) {
    text = String(text);
    return spaces(Math.floor((WIDTH - text.length) / 2)) + text;
  }

  // Split text into lines no longer than `width`, breaking on spaces.
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

  // Left text wraps; right text sits at the end of the first line.
  function row(left, right) {
    right = String(right);
    var lines = wrap(left, Math.max(4, WIDTH - right.length - 1));
    lines[0] = lines[0] + spaces(WIDTH - lines[0].length - right.length) + right;
    return lines;
  }

  function label(it) {
    return it.name + (it.portion && it.portion !== "Regular" ? " (" + it.portion + ")" : "");
  }

  function num(n) { return String(Math.round(Number(n) || 0)); } // plain digits: the printer cannot print the rupee sign

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

  // Sends text to the bridge app. Shows an alert if it fails.
  function print(text) {
    return fetch(BRIDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text + "\n", feed: 3, cut: true })
    })
      .then(function (res) { return res.json(); })
      .then(function (out) {
        if (!out.ok) throw new Error(out.error || "Print failed");
      })
      .catch(function (err) {
        console.error("BridgePrint:", err);
        alert("Could not print: " + (err && err.message ? err.message : err) +
          "\n\nOpen the Thermal Bridge app and tap Start bridge.");
      });
  }

  window.BridgePrint = { buildKot: buildKot, buildBill: buildBill, print: print };
})();