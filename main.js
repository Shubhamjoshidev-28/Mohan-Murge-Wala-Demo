/*!
 * Mohan Murge Wala — POS Demo
 * main.js — single source of truth for menu data, storage helpers,
 * the home/order-builder app, and receipt rendering.
 *
 * This file is intentionally framework-free (vanilla JS) so the whole
 * demo can be hosted as static files on GitHub Pages.
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. MENU DATA — single source of truth for every page in the app.
  // ---------------------------------------------------------------------

  var MENU = Object.freeze([
    // ---- Veg Starters (receiptType: main-kitchen) ----
    { id: "vs-cheese-chilli", name: "Cheese Chilli", category: "veg-starters", type: "single", portion: "Regular", price: 260, receiptType: "main-kitchen" },
    { id: "vs-shahi-paneer", name: "Shahi Paneer", category: "veg-starters", type: "single", portion: "Regular", price: 300, receiptType: "main-kitchen" },
    { id: "vs-kadai-paneer", name: "Kadai Paneer", category: "veg-starters", type: "single", portion: "Regular", price: 300, receiptType: "main-kitchen" },
    { id: "vs-paneer-butter-masala", name: "Paneer Butter Masala", category: "veg-starters", type: "single", portion: "Regular", price: 300, receiptType: "main-kitchen" },
    { id: "vs-dal-makhani", name: "Dal Makhani", category: "veg-starters", type: "single", portion: "Regular", price: 200, receiptType: "main-kitchen" },
    { id: "vs-raita", name: "Raita", category: "veg-starters", type: "single", portion: "Regular", price: 100, receiptType: "main-kitchen" },
    { id: "vs-mix-raita", name: "Mix Raita", category: "veg-starters", type: "single", portion: "Regular", price: 120, receiptType: "main-kitchen" },
    { id: "vs-mushroom-malai-tikka", name: "Mushroom Malai Tikka", category: "veg-starters", type: "single", portion: "Regular", price: 250, receiptType: "main-kitchen" },
    { id: "vs-mushroom-tikka", name: "Mushroom Tikka", category: "veg-starters", type: "single", portion: "Regular", price: 220, receiptType: "main-kitchen" },
    { id: "vs-mushroom-chilli", name: "Mushroom Chilli", category: "veg-starters", type: "single", portion: "Regular", price: 250, receiptType: "main-kitchen" },

    // ---- Breads (receiptType: tandoor) ----
    { id: "br-tandoori-roti", name: "Tandoori Roti", category: "breads", type: "single", portion: "Regular", price: 20, receiptType: "tandoor" },
    { id: "br-tandoori-butter-roti", name: "Tandoori Butter Roti", category: "breads", type: "single", portion: "Regular", price: 30, receiptType: "tandoor" },
    { id: "br-naan", name: "Naan", category: "breads", type: "single", portion: "Regular", price: 30, receiptType: "tandoor" },
    { id: "br-butter-naan", name: "Butter Naan", category: "breads", type: "single", portion: "Regular", price: 40, receiptType: "tandoor" },
    { id: "br-masala-roti", name: "Masala Roti", category: "breads", type: "single", portion: "Regular", price: 30, receiptType: "tandoor" },
    { id: "br-parantha", name: "Parantha", category: "breads", type: "single", portion: "Regular", price: 40, receiptType: "tandoor" },
    { id: "br-garlic-parantha", name: "Garlic Parantha", category: "breads", type: "single", portion: "Regular", price: 50, receiptType: "tandoor" },
    { id: "br-garlic-naan", name: "Garlic Naan", category: "breads", type: "single", portion: "Regular", price: 50, receiptType: "tandoor" },
    { id: "br-pyaaz-parantha", name: "Pyaaz Parantha", category: "breads", type: "single", portion: "Regular", price: 50, receiptType: "tandoor" },

    // ---- Snacks ----
    { id: "sn-paneer-tikka", name: "Paneer Tikka", category: "snacks", type: "single", portion: "Regular", price: 250, receiptType: "tandoor" },
    { id: "sn-peanut-masala", name: "Peanut Masala", category: "snacks", type: "single", portion: "Regular", price: 120, receiptType: "main-kitchen" },
    { id: "sn-chana-masala", name: "Chana Masala", category: "snacks", type: "single", portion: "Regular", price: 120, receiptType: "main-kitchen" },
    { id: "sn-plain-peanut", name: "Plain Peanut", category: "snacks", type: "single", portion: "Regular", price: 50, receiptType: "main-kitchen" },

    // ---- Papad & Salad () ----
    { id: "ex-plain-papad", name: "Plain Papad", category: "extras", type: "single", portion: "Per Pc", price: 20, receiptType: "main-kitchen" },
    { id: "ex-masala-papad", name: "Masala Papad", category: "extras", type: "single", portion: "Per Pc", price: 60, receiptType: "main-kitchen" },
    { id: "ex-green-salad", name: "Green Salad", category: "extras", type: "single", portion: "Regular", price: 80, receiptType: "main-kitchen" },

    // ---- Starters — Non-Veg ----
    { id: "st-tandoori-chicken-h", name: "Tandoori Chicken", category: "starters", type: "half-full", portion: "Half", price: 280, receiptType: "tandoor" },
    { id: "st-tandoori-chicken-f", name: "Tandoori Chicken", category: "starters", type: "half-full", portion: "Full", price: 450, receiptType: "tandoor" },
    { id: "st-afgani-chicken-h", name: "Afgani Chicken", category: "starters", type: "half-full", portion: "Half", price: 300, receiptType: "tandoor" },
    { id: "st-afgani-chicken-f", name: "Afgani Chicken", category: "starters", type: "half-full", portion: "Full", price: 520, receiptType: "tandoor" },
    { id: "st-tangri-kabab-h", name: "Tangri Kabab", category: "starters", type: "half-full", portion: "Half", price: 180, receiptType: "tandoor" },
    { id: "st-tangri-kabab-f", name: "Tangri Kabab", category: "starters", type: "half-full", portion: "Full", price: 320, receiptType: "tandoor" },
    { id: "st-kalmi-kabab-h", name: "Kalmi Kabab", category: "starters", type: "half-full", portion: "Half", price: 180, receiptType: "tandoor" },
    { id: "st-kalmi-kabab-f", name: "Kalmi Kabab", category: "starters", type: "half-full", portion: "Full", price: 320, receiptType: "tandoor" },
    { id: "st-seekh-kabab", name: "Seekh Kabab", category: "starters", type: "single", portion: "Regular", price: 300, receiptType: "tandoor" },
    { id: "st-plain-tangri-h", name: "Plain Tangri", category: "starters", type: "half-full", portion: "Half", price: 150, receiptType: "tandoor" },
    { id: "st-plain-tangri-f", name: "Plain Tangri", category: "starters", type: "half-full", portion: "Full", price: 300, receiptType: "tandoor" },
    { id: "st-malai-tikka", name: "Malai Tikka", category: "starters", type: "single", portion: "8 Pc", price: 320, receiptType: "tandoor" },
    { id: "st-chicken-tikka", name: "Chicken Tikka", category: "starters", type: "single", portion: "8 Pc", price: 320, receiptType: "tandoor" },
    { id: "st-wings", name: "Wings", category: "starters", type: "single", portion: "8 Pc", price: 320, receiptType: "tandoor" },
    { id: "st-fish-tikka", name: "Fish Tikka", category: "starters", type: "single", portion: "6 Pc", price: 380, receiptType: "main-kitchen" },
    { id: "st-fish-pakora", name: "Fish Pakora", category: "starters", type: "single", portion: "250 gm", price: 300, receiptType: "main-kitchen" },
    { id: "st-chicken-pakora-h", name: "Chicken Pakora", category: "starters", type: "half-full", portion: "Half", price: 250, receiptType: "main-kitchen" },
    { id: "st-chicken-pakora-f", name: "Chicken Pakora", category: "starters", type: "half-full", portion: "Full", price: 480, receiptType: "main-kitchen" },
    { id: "st-steam-chicken", name: "Steam Chicken", category: "starters", type: "single", portion: "Per Pc", price: 150, receiptType: "main-kitchen" },
    { id: "st-steam-fish", name: "Steam Fish", category: "starters", type: "single", portion: "250 gm", price: 300, receiptType: "main-kitchen" },
    { id: "st-chilli-chicken-h", name: "Chilli Chicken", category: "starters", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "st-chilli-chicken-f", name: "Chilli Chicken", category: "starters", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "st-kfc-chicken-h", name: "KFC Chicken", category: "starters", type: "half-full", portion: "Half", price: 280, receiptType: "main-kitchen" },
    { id: "st-kfc-chicken-f", name: "KFC Chicken", category: "starters", type: "half-full", portion: "Full", price: 500, receiptType: "main-kitchen" },
    { id: "st-egg-bhurji", name: "Egg Bhurji", category: "starters", type: "single", portion: "4 Eggs", price: 120, receiptType: "main-kitchen" },

    // ---- Main Course (receiptType: main-kitchen) ----
    { id: "mc-butter-chicken-q", name: "Butter Chicken", category: "main-course", type: "qtr-half-full", portion: "Quarter", price: 180, receiptType: "main-kitchen" },
    { id: "mc-butter-chicken-h", name: "Butter Chicken", category: "main-course", type: "qtr-half-full", portion: "Half", price: 350, receiptType: "main-kitchen" },
    { id: "mc-butter-chicken-f", name: "Butter Chicken", category: "main-course", type: "qtr-half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-kadai-chicken-q", name: "Kadai Chicken", category: "main-course", type: "qtr-half-full", portion: "Quarter", price: 180, receiptType: "main-kitchen" },
    { id: "mc-kadai-chicken-h", name: "Kadai Chicken", category: "main-course", type: "qtr-half-full", portion: "Half", price: 350, receiptType: "main-kitchen" },
    { id: "mc-kadai-chicken-f", name: "Kadai Chicken", category: "main-course", type: "qtr-half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-chicken-kari-q", name: "Chicken Kari", category: "main-course", type: "qtr-half-full", portion: "Quarter", price: 180, receiptType: "main-kitchen" },
    { id: "mc-chicken-kari-h", name: "Chicken Kari", category: "main-course", type: "qtr-half-full", portion: "Half", price: 350, receiptType: "main-kitchen" },
    { id: "mc-chicken-kari-f", name: "Chicken Kari", category: "main-course", type: "qtr-half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-lemon-chicken-h", name: "Lemon Chicken", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-lemon-chicken-f", name: "Lemon Chicken", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-kali-mirch-chicken-h", name: "Kali Mirch Chicken", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-kali-mirch-chicken-f", name: "Kali Mirch Chicken", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-lemon-chicken-dry-h", name: "Lemon Chicken Dry", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-lemon-chicken-dry-f", name: "Lemon Chicken Dry", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-rada-chicken-h", name: "Rada Chicken", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-rada-chicken-f", name: "Rada Chicken", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-masala-chicken-h", name: "Masala Chicken", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-masala-chicken-f", name: "Masala Chicken", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-home-made-chicken-h", name: "Home Made Chicken", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-home-made-chicken-f", name: "Home Made Chicken", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-tawa-chicken-h", name: "Tawa Chicken", category: "main-course", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "mc-tawa-chicken-f", name: "Tawa Chicken", category: "main-course", type: "half-full", portion: "Full", price: 630, receiptType: "main-kitchen" },
    { id: "mc-fish-curry-h", name: "Fish Curry", category: "main-course", type: "half-full", portion: "Half", price: 280, receiptType: "main-kitchen" },
    { id: "mc-fish-curry-f", name: "Fish Curry", category: "main-course", type: "half-full", portion: "Full", price: 550, receiptType: "main-kitchen" },

    // ---- Combo (12:00 PM – 4:00 PM) ----
    { id: "cb-chicken-curry-plate", name: "Chicken Curry Plate (2 pc + 4 Roti)", category: "combo", type: "single", portion: "Combo", price: 200, receiptType: "main-kitchen" },
    { id: "cb-mutton-curry-plate", name: "Mutton Curry Plate (2 pc + 4 Roti)", category: "combo", type: "single", portion: "Combo", price: 280, receiptType: "main-kitchen" },

    // ---- Boneless (receiptType: main-kitchen) ----
    { id: "bn-chilli-chicken-h", name: "Chilli Chicken (Boneless)", category: "boneless", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "bn-chilli-chicken-f", name: "Chilli Chicken (Boneless)", category: "boneless", type: "half-full", portion: "Full", price: 650, receiptType: "main-kitchen" },
    { id: "bn-butter-chicken-h", name: "Butter Chicken (Boneless)", category: "boneless", type: "half-full", portion: "Half", price: 380, receiptType: "main-kitchen" },
    { id: "bn-butter-chicken-f", name: "Butter Chicken (Boneless)", category: "boneless", type: "half-full", portion: "Full", price: 650, receiptType: "main-kitchen" },
    { id: "bn-kali-mirch-chicken-h", name: "Kali Mirch Chicken (Boneless)", category: "boneless", type: "half-full", portion: "Half", price: 400, receiptType: "main-kitchen" },
    { id: "bn-kali-mirch-chicken-f", name: "Kali Mirch Chicken (Boneless)", category: "boneless", type: "half-full", portion: "Full", price: 650, receiptType: "main-kitchen" },
    { id: "bn-lemon-chicken-dry-h", name: "Lemon Chicken Dry (Boneless)", category: "boneless", type: "half-full", portion: "Half", price: 400, receiptType: "main-kitchen" },
    { id: "bn-lemon-chicken-dry-f", name: "Lemon Chicken Dry (Boneless)", category: "boneless", type: "half-full", portion: "Full", price: 650, receiptType: "main-kitchen" },

    // ---- Mutton (receiptType: main-kitchen) ----
    { id: "mt-mutton-curry", name: "Mutton Curry", category: "mutton", type: "single", portion: "3 Pc", price: 450, receiptType: "main-kitchen" },
    { id: "mt-mutton-rada", name: "Mutton Rada", category: "mutton", type: "single", portion: "3 Pc", price: 520, receiptType: "main-kitchen" },
    { id: "mt-mutton-rogan-josh", name: "Mutton Rogan Josh", category: "mutton", type: "single", portion: "3 Pc", price: 550, receiptType: "main-kitchen" },

    // ---- Beverages (receiptType: bill-only) ----
    { id: "bv-mineral-water", name: "Mineral Water (MRP)", category: "beverages", type: "single", portion: "Regular", price: 25, receiptType: "bill-only" },
    { id: "bv-mineral-water", name: "Mineral Water (MRP)", category: "beverages", type: "single", portion: "Regular", price: 20, receiptType: "bill-only" },
    { id: "bv-soda", name: "Soda (MRP)", category: "beverages", type: "single", portion: "Regular", price: 20, receiptType: "bill-only" },
    { id: "bv-cold-drinks", name: "Cold Drinks (BOTTLE)", category: "beverages", type: "single", portion: "Regular", price: 20, receiptType: "bill-only" },
    { id: "bv-cold-drinks", name: "Cold Drinks (BOTTLE)", category: "beverages", type: "single", portion: "Regular", price: 40, receiptType: "bill-only" },
    { id: "bv-cold-drinks-can", name: "Cold Drinks (CAN)", category: "beverages", type: "single", portion: "Regular", price: 30, receiptType: "bill-only" },
    { id: "bv-cold-drinks-can", name: "Cold Drinks (CAN)", category: "beverages", type: "single", portion: "Regular", price: 70, receiptType: "bill-only" },
    { id: "bv-ice-cubes", name: "Ice Cubes", category: "beverages", type: "single", portion: "Regular", price: 20, receiptType: "bill-only" },
    { id: "bv-glass", name: "Glass", category: "beverages", type: "single", portion: "Regular", price: 5, receiptType: "bill-only" }
  ]);

  var CATEGORY_LABELS = {
    "veg-starters": "Veg Starters",
    "breads": "Breads",
    "snacks": "Snacks",
    "extras": "Papad & Salad",
    "starters": "Starters (Non-Veg)",
    "main-course": "Main Course",
    "combo": "Combo",
    "boneless": "Boneless",
    "mutton": "Mutton",
    "beverages": "Beverages"
  };

  var RECEIPT_LABELS = {
    "main-kitchen": "Main Kitchen",
    "tandoor": "Tandoor",
    "bill-only": "Bill Only"
  };

  var STORAGE_KEY = "mohanMurgeWalaOrders";
  var STORAGE_BACKUP_KEY = "mohanMurgeWalaOrders_corrupted_backup";
  var RESTAURANT_NAME = "Mohan Murge Wala";

  // ---------------------------------------------------------------------
  // 2. UTILITIES
  // ---------------------------------------------------------------------

  /** Safe currency formatter for Indian Rupees. Never throws. */
  function formatCurrency(value) {
    var n = Number(value);
    if (!isFinite(n) || isNaN(n)) n = 0;
    if (n < 0) n = 0;
    n = Math.round(n);
    try {
      return "\u20B9" + n.toLocaleString("en-IN");
    } catch (err) {
      return "\u20B9" + String(n);
    }
  }

  /** Safe integer parse for quantities. Falls back to 0. */
  function safeQuantity(value) {
    var n = parseInt(value, 10);
    if (!isFinite(n) || isNaN(n) || n < 0) return 0;
    return n;
  }

  /** Safe positive price parse. Falls back to 0 and logs a warning. */
  function safePrice(value) {
    var n = Number(value);
    if (!isFinite(n) || isNaN(n) || n < 0) {
      console.warn("MohanPOS: encountered invalid price, defaulting to 0:", value);
      return 0;
    }
    return n;
  }

  function generateId(prefix) {
    var rand = Math.random().toString(36).slice(2, 9);
    var time = Date.now().toString(36);
    return (prefix || "id") + "-" + time + "-" + rand;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function escapeAttribute(value) {
    return String(value == null ? "" : value);
  }

  /** Element creator helper. Uses textContent (never innerHTML) for text. */
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "class") node.className = attrs[key];
        else if (key === "html") { /* explicitly disallowed - ignore */ }
        else node.setAttribute(key, attrs[key]);
      });
    }
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clearNode(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function getQueryParam(name) {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get(name);
    } catch (err) {
      console.error("MohanPOS: failed to parse query string", err);
      return null;
    }
  }

  function formatDateTime(isoString) {
    try {
      var d = new Date(isoString);
      if (isNaN(d.getTime())) return "Unknown time";
      return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch (err) {
      return "Unknown time";
    }
  }

  // ---------------------------------------------------------------------
  // 3. LOCALSTORAGE SAFETY LAYER
  // ---------------------------------------------------------------------

  var storageCorrupted = false; // set true when JSON parse fails
  var storageUnavailable = false; // set true when localStorage itself is unusable

  function isStorageAvailable() {
    try {
      var testKey = "__mohan_pos_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  /** Validate that a parsed value looks like an array of order objects. */
  function isValidOrdersArray(value) {
    if (!Array.isArray(value)) return false;
    return value.every(function (order) {
      return order && typeof order === "object" &&
        typeof order.id === "string" &&
        typeof order.tableNumber === "string" &&
        Array.isArray(order.items);
    });
  }

  /** Sanitize a single order's items so downstream code never sees garbage. */
  function sanitizeOrder(order) {
    var items = Array.isArray(order.items) ? order.items : [];
    var cleanItems = items
      .filter(function (it) { return it && typeof it === "object" && it.itemId; })
      .map(function (it) {
        return {
          itemId: String(it.itemId),
          name: typeof it.name === "string" && it.name ? it.name : "Unnamed item",
          portion: typeof it.portion === "string" ? it.portion : "Regular",
          category: typeof it.category === "string" ? it.category : "extras",
          receiptType: ["main-kitchen", "tandoor", "bill-only"].indexOf(it.receiptType) !== -1 ? it.receiptType : "bill-only",
          price: safePrice(it.price),
          quantity: safeQuantity(it.quantity) || 0
        };
      })
      .filter(function (it) { return it.quantity > 0; });

    return {
      id: String(order.id),
      tableNumber: String(order.tableNumber || "").trim(),
      items: cleanItems,
      total: computeOrderTotal(cleanItems),
      createdAt: typeof order.createdAt === "string" ? order.createdAt : nowIso(),
      updatedAt: typeof order.updatedAt === "string" ? order.updatedAt : nowIso()
    };
  }

  /**
   * Load orders safely from localStorage.
   * Returns an array (never throws). Sets storageCorrupted / storageUnavailable
   * flags so the UI can show a recovery banner.
   */
  function loadOrders() {
    storageCorrupted = false;
    storageUnavailable = false;

    if (!isStorageAvailable()) {
      storageUnavailable = true;
      console.error("MohanPOS: localStorage is not available in this browser/context.");
      return [];
    }

    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      storageUnavailable = true;
      console.error("MohanPOS: failed to read from localStorage.", err);
      return [];
    }

    if (raw === null || raw === undefined || raw === "") {
      return [];
    }

    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("MohanPOS: saved order data is corrupted JSON.", err);
      storageCorrupted = true;
      try {
        window.localStorage.setItem(STORAGE_BACKUP_KEY, raw);
      } catch (backupErr) {
        console.error("MohanPOS: could not back up corrupted data.", backupErr);
      }
      return [];
    }

    if (!isValidOrdersArray(parsed)) {
      console.error("MohanPOS: saved order data does not match the expected structure.");
      storageCorrupted = true;
      try {
        window.localStorage.setItem(STORAGE_BACKUP_KEY, raw);
      } catch (backupErr) {
        console.error("MohanPOS: could not back up corrupted data.", backupErr);
      }
      return [];
    }

    try {
      return parsed.map(sanitizeOrder);
    } catch (err) {
      console.error("MohanPOS: unexpected error sanitizing orders.", err);
      storageCorrupted = true;
      return [];
    }
  }

  /** Persist the full orders array. Returns {success, message}. */
  function saveOrders(orders) {
    if (!Array.isArray(orders)) {
      console.error("MohanPOS: saveOrders called with a non-array.", orders);
      return { success: false, message: "Could not save: internal data error." };
    }
    if (!isStorageAvailable()) {
      return { success: false, message: "This browser is blocking local storage, so orders cannot be saved here." };
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      return { success: true, message: "" };
    } catch (err) {
      console.error("MohanPOS: failed to write orders to localStorage.", err);
      var isQuota = err && (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014);
      return {
        success: false,
        message: isQuota
          ? "Storage is full on this device. Delete some old orders and try again."
          : "Could not save the order on this device. Please try again."
      };
    }
  }

  function getOrderById(orderId) {
    if (!orderId) return null;
    var orders = loadOrders();
    var found = orders.filter(function (o) { return o.id === orderId; });
    return found.length ? found[0] : null;
  }

  function addOrder(order) {
    var orders = loadOrders();
    orders.push(order);
    return saveOrders(orders);
  }

  function updateOrder(updatedOrder) {
    var orders = loadOrders();
    var index = -1;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === updatedOrder.id) { index = i; break; }
    }
    if (index === -1) {
      return { success: false, message: "This order could not be found. Please refresh the order list." };
    }
    orders[index] = updatedOrder;
    return saveOrders(orders);
  }

  function deleteOrder(orderId) {
    var orders = loadOrders();
    var next = orders.filter(function (o) { return o.id !== orderId; });
    if (next.length === orders.length) {
      return { success: false, message: "This order could not be found. It may already have been deleted." };
    }
    return saveOrders(next);
  }

  function clearCorruptedBackup() {
    try {
      window.localStorage.removeItem(STORAGE_BACKUP_KEY);
    } catch (err) { /* nothing more we can do */ }
  }

  // ---------------------------------------------------------------------
  // 4. ORDER MATH
  // ---------------------------------------------------------------------

  function computeOrderTotal(items) {
    if (!Array.isArray(items)) return 0;
    var total = items.reduce(function (sum, it) {
      var price = safePrice(it.price);
      var qty = safeQuantity(it.quantity);
      return sum + (price * qty);
    }, 0);
    return Math.round(total);
  }

  function validateTableNumber(value) {
    var trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) {
      return { valid: false, message: "Please enter a table number." };
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9\-\/ ]{0,9}$/.test(trimmed)) {
      return { valid: false, message: "Use a simple table label like 4, A1, or T5." };
    }
    return { valid: true, value: trimmed };
  }

  // ---------------------------------------------------------------------
  // 5. MENU FILTERING (never mutates MENU)
  // ---------------------------------------------------------------------

  function filterMenu(options) {
    options = options || {};
    var search = (options.search || "").toLowerCase().trim();
    var category = options.category || "all";
    var portion = options.portion || "all";

    return MENU.filter(function (item) {
      if (!item || typeof item.name !== "string") return false;
      if (search && item.name.toLowerCase().indexOf(search) === -1) return false;
      if (category !== "all" && item.category !== category) return false;
      if (portion === "quarter" && item.portion !== "Quarter") return false;
      if (portion === "half" && item.portion !== "Half") return false;
      if (portion === "full" && item.portion !== "Full") return false;
      return true;
    });
  }

  // =======================================================================
  // 6. HOME + ORDER BUILDER APP  (index.html)
  // =======================================================================

  var appState = {
    view: "home", // "home" | "builder"
    editingOrderId: null,
    tableNumber: "",
    cart: [], // { itemId, name, portion, category, receiptType, price, quantity }
    search: "",
    category: "all",
    portion: "all"
  };

  var toastTimer = null;

  function showToast(message, isError) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("toast-error", !!isError);
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 3200);
  }

  function renderStorageBanner() {
    var banner = document.getElementById("storageBanner");
    if (!banner) return;
    if (storageUnavailable) {
      clearNode(banner);
      banner.appendChild(el("p", { class: "banner-title" }, "Local storage is unavailable"));
      banner.appendChild(el("p", null, "This browser or private-browsing mode is blocking local storage, so orders cannot be saved or loaded here. Try a normal browser tab."));
      banner.hidden = false;
      return;
    }
    if (storageCorrupted) {
      clearNode(banner);
      banner.appendChild(el("p", { class: "banner-title" }, "Saved order data could not be read"));
      banner.appendChild(el("p", null, "The order data stored on this device was unreadable, so it has not been changed or deleted. A backup copy was kept in this browser's storage."));
      var clearBtn = el("button", { type: "button", class: "btn btn-ghost btn-sm" }, "Dismiss and start with an empty order list");
      clearBtn.addEventListener("click", function () {
        clearCorruptedBackup();
        storageCorrupted = false;
        banner.hidden = true;
        renderHome();
      });
      banner.appendChild(clearBtn);
      banner.hidden = false;
      return;
    }
    banner.hidden = true;
  }

  function itemSummary(order) {
    if (!order.items.length) return "No items";
    var names = order.items.slice(0, 3).map(function (it) {
      return it.name + " (" + it.quantity + (it.portion && it.portion !== "Regular" ? " " + it.portion : "") + ")";
    });
    var extra = order.items.length > 3 ? " +" + (order.items.length - 3) + " more" : "";
    return names.join(", ") + extra;
  }

  function renderOrderCard(order) {
    var card = el("article", { class: "order-card" });

    var head = el("div", { class: "order-card-head" });
    head.appendChild(el("span", { class: "order-card-table" }, "Table " + order.tableNumber));
    head.appendChild(el("span", { class: "order-card-total" }, formatCurrency(order.total)));
    card.appendChild(head);

    card.appendChild(el("p", { class: "order-card-id" }, "Order #" + order.id.slice(-6).toUpperCase()));
    card.appendChild(el("p", { class: "order-card-items" }, itemSummary(order)));
    card.appendChild(el("p", { class: "order-card-time" }, "Updated " + formatDateTime(order.updatedAt)));

    var actions = el("div", { class: "order-card-actions" });

    var editBtn = el("button", { type: "button", class: "btn btn-outline btn-sm" }, "Edit");
    editBtn.addEventListener("click", function () { openEditOrder(order.id); });
    actions.appendChild(editBtn);

    var kitchenBtn = el("button", { type: "button", class: "btn btn-outline btn-sm" }, "Main Kitchen");
    kitchenBtn.addEventListener("click", function () { openReceipt("kitchen-recepit.html", order.id); });
    actions.appendChild(kitchenBtn);

    var tandoorBtn = el("button", { type: "button", class: "btn btn-outline btn-sm" }, "Tandoor");
    tandoorBtn.addEventListener("click", function () { openReceipt("tandoor-recepit.html", order.id); });
    actions.appendChild(tandoorBtn);

    var billBtn = el("button", { type: "button", class: "btn btn-outline btn-sm" }, "Bill");
    billBtn.addEventListener("click", function () { openReceipt("bill-recepit.html", order.id); });
    actions.appendChild(billBtn);

    var deleteBtn = el("button", { type: "button", class: "btn btn-danger-outline btn-sm" }, "Delete");
    deleteBtn.addEventListener("click", function () { confirmDeleteOrder(order); });
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    return card;
  }

  function openReceipt(page, orderId) {
    window.open(page + "?order=" + encodeURIComponent(orderId), "_blank", "noopener");
  }

  function renderHome() {
    var grid = document.getElementById("ordersGrid");
    var empty = document.getElementById("ordersEmpty");
    var countLabel = document.getElementById("orderCount");
    if (!grid) return;

    var orders = loadOrders();
    renderStorageBanner();

    orders.sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    clearNode(grid);
    if (!orders.length) {
      empty.hidden = false;
    } else {
      empty.hidden = true;
      orders.forEach(function (order) {
        grid.appendChild(renderOrderCard(order));
      });
    }
    if (countLabel) {
      countLabel.textContent = orders.length
        ? orders.length + " saved order" + (orders.length === 1 ? "" : "s")
        : "";
    }
  }

  // --- Order builder ---

  function switchView(view) {
    appState.view = view;
    var homeView = document.getElementById("homeView");
    var builderView = document.getElementById("builderView");
    if (!homeView || !builderView) return;
    homeView.hidden = view !== "home";
    builderView.hidden = view !== "builder";
    if (view === "home") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      renderHome();
    }
  }

  function resetBuilderState() {
    appState.editingOrderId = null;
    appState.tableNumber = "";
    appState.cart = [];
    appState.search = "";
    appState.category = "all";
    appState.portion = "all";
  }

  function openNewOrder() {
    resetBuilderState();
    switchView("builder");
    renderBuilder();
    var input = document.getElementById("tableNumberInput");
    if (input) { input.value = ""; input.focus(); }
    hideFieldError("tableNumberError");
    hideFieldError("orderError");
  }

  function openEditOrder(orderId) {
    var order = getOrderById(orderId);
    if (!order) {
      showToast("This order could not be found. Please refresh the order list.", true);
      renderHome();
      return;
    }
    resetBuilderState();
    appState.editingOrderId = order.id;
    appState.tableNumber = order.tableNumber;
    appState.cart = order.items.map(function (it) {
      return {
        itemId: it.itemId, name: it.name, portion: it.portion,
        category: it.category, receiptType: it.receiptType,
        price: it.price, quantity: it.quantity
      };
    });
    switchView("builder");
    renderBuilder();
    var input = document.getElementById("tableNumberInput");
    if (input) input.value = order.tableNumber;
    hideFieldError("tableNumberError");
    hideFieldError("orderError");
  }

  function hideFieldError(id) {
    var node = document.getElementById(id);
    if (node) { node.hidden = true; node.textContent = ""; }
  }

  function showFieldError(id, message) {
    var node = document.getElementById(id);
    if (node) { node.hidden = false; node.textContent = message; }
  }

  function renderCategoryChips() {
    var wrap = document.getElementById("categoryChips");
    if (!wrap) return;
    clearNode(wrap);
    var cats = ["all", "veg-starters", "breads", "snacks", "extras", "starters", "main-course", "combo", "boneless", "mutton", "beverages"];
    cats.forEach(function (cat) {
      var label = cat === "all" ? "All" : (CATEGORY_LABELS[cat] || cat);
      var btn = el("button", {
        type: "button",
        class: "chip" + (appState.category === cat ? " chip-active" : ""),
        "aria-pressed": appState.category === cat ? "true" : "false"
      }, label);
      btn.addEventListener("click", function () {
        appState.category = cat;
        renderCategoryChips();
        renderMenuGrid();
      });
      wrap.appendChild(btn);
    });
  }

  function renderPortionChips() {
    var wrap = document.getElementById("portionChips");
    if (!wrap) return;
    clearNode(wrap);
    var options = [
      { key: "all", label: "All Portions" },
      { key: "quarter", label: "Quarter" },
      { key: "half", label: "Half" },
      { key: "full", label: "Full" }
    ];
    options.forEach(function (opt) {
      var btn = el("button", {
        type: "button",
        class: "chip" + (appState.portion === opt.key ? " chip-active" : ""),
        "aria-pressed": appState.portion === opt.key ? "true" : "false"
      }, opt.label);
      btn.addEventListener("click", function () {
        appState.portion = opt.key;
        renderPortionChips();
        renderMenuGrid();
      });
      wrap.appendChild(btn);
    });
  }

  function cartQuantityFor(itemId) {
    var found = appState.cart.filter(function (c) { return c.itemId === itemId; });
    return found.length ? found[0].quantity : 0;
  }

  function renderMenuGrid() {
    var grid = document.getElementById("menuGrid");
    var empty = document.getElementById("menuEmpty");
    if (!grid) return;

    var items = filterMenu({
      search: appState.search,
      category: appState.category,
      portion: appState.portion
    });

    clearNode(grid);
    if (!items.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    items.forEach(function (item) {
      var card = el("article", { class: "menu-card" });
      card.appendChild(el("h3", { class: "menu-card-name" }, item.name));
      var meta = el("p", { class: "menu-card-meta" },
        (CATEGORY_LABELS[item.category] || item.category) +
        (item.portion !== "Regular" ? " \u00B7 " + item.portion : ""));
      card.appendChild(meta);
      card.appendChild(el("p", { class: "menu-card-price" }, formatCurrency(item.price)));

      var qty = cartQuantityFor(item.id);
      var addRow = el("div", { class: "menu-card-add" });
      var addBtn = el("button", {
        type: "button",
        class: "btn btn-quick-add",
        "aria-label": "Add " + item.name + (item.portion !== "Regular" ? " " + item.portion : "")
      }, qty > 0 ? ("+ Add (" + qty + " in order)") : "+ Add");
      addBtn.addEventListener("click", function () {
        addToCart(item);
      });
      addRow.appendChild(addBtn);
      card.appendChild(addRow);

      grid.appendChild(card);
    });
  }

  function addToCart(menuItem) {
    var existing = appState.cart.filter(function (c) { return c.itemId === menuItem.id; })[0];
    if (existing) {
      existing.quantity = safeQuantity(existing.quantity) + 1;
    } else {
      appState.cart.push({
        itemId: menuItem.id,
        name: menuItem.name,
        portion: menuItem.portion,
        category: menuItem.category,
        receiptType: menuItem.receiptType,
        price: safePrice(menuItem.price),
        quantity: 1
      });
    }
    renderMenuGrid();
    renderCart();
  }

  function changeCartQuantity(itemId, delta) {
    var line = appState.cart.filter(function (c) { return c.itemId === itemId; })[0];
    if (!line) return;
    line.quantity = safeQuantity(line.quantity) + delta;
    if (line.quantity <= 0) {
      appState.cart = appState.cart.filter(function (c) { return c.itemId !== itemId; });
    }
    renderMenuGrid();
    renderCart();
  }

  function removeFromCart(itemId) {
    appState.cart = appState.cart.filter(function (c) { return c.itemId !== itemId; });
    renderMenuGrid();
    renderCart();
  }

  function renderCart() {
    var list = document.getElementById("cartList");
    var empty = document.getElementById("cartEmpty");
    var totalLabel = document.getElementById("cartTotal");
    if (!list) return;

    clearNode(list);
    if (!appState.cart.length) {
      empty.hidden = false;
    } else {
      empty.hidden = true;
      appState.cart.forEach(function (line) {
        var li = el("li", { class: "cart-line" });

        var info = el("div", { class: "cart-line-info" });
        info.appendChild(el("span", { class: "cart-line-name" },
          line.name + (line.portion !== "Regular" ? " (" + line.portion + ")" : "")));
        info.appendChild(el("span", { class: "cart-line-price" },
          formatCurrency(line.price) + " each"));
        li.appendChild(info);

        var controls = el("div", { class: "cart-line-controls" });
        var minusBtn = el("button", { type: "button", class: "btn btn-step", "aria-label": "Decrease quantity of " + line.name }, "\u2212");
        minusBtn.addEventListener("click", function () { changeCartQuantity(line.itemId, -1); });
        var qtyLabel = el("span", { class: "cart-line-qty" }, String(line.quantity));
        var plusBtn = el("button", { type: "button", class: "btn btn-step", "aria-label": "Increase quantity of " + line.name }, "+");
        plusBtn.addEventListener("click", function () { changeCartQuantity(line.itemId, 1); });
        controls.appendChild(minusBtn);
        controls.appendChild(qtyLabel);
        controls.appendChild(plusBtn);
        li.appendChild(controls);

        li.appendChild(el("span", { class: "cart-line-subtotal" }, formatCurrency(line.price * line.quantity)));

        var removeBtn = el("button", { type: "button", class: "btn btn-text-danger", "aria-label": "Remove " + line.name }, "Remove");
        removeBtn.addEventListener("click", function () { removeFromCart(line.itemId); });
        li.appendChild(removeBtn);

        list.appendChild(li);
      });
    }

    if (totalLabel) totalLabel.textContent = formatCurrency(computeOrderTotal(appState.cart));
  }

  function renderBuilder() {
    renderCategoryChips();
    renderPortionChips();
    renderMenuGrid();
    renderCart();
  }

  function saveCurrentOrder() {
    hideFieldError("tableNumberError");
    hideFieldError("orderError");

    var input = document.getElementById("tableNumberInput");
    var validation = validateTableNumber(input ? input.value : "");
    if (!validation.valid) {
      showFieldError("tableNumberError", validation.message);
      if (input) input.focus();
      return;
    }

    if (!appState.cart.length) {
      showFieldError("orderError", "Add at least one item before saving the order.");
      return;
    }

    var cleanItems = appState.cart
      .map(function (line) {
        return {
          itemId: line.itemId,
          name: line.name,
          portion: line.portion,
          category: line.category,
          receiptType: line.receiptType,
          price: safePrice(line.price),
          quantity: safeQuantity(line.quantity)
        };
      })
      .filter(function (line) { return line.quantity > 0; });

    if (!cleanItems.length) {
      showFieldError("orderError", "Add at least one item before saving the order.");
      return;
    }

    var result;
    if (appState.editingOrderId) {
      var existing = getOrderById(appState.editingOrderId);
      if (!existing) {
        showFieldError("orderError", "This order could not be found. Please refresh the order list.");
        return;
      }
      var updated = {
        id: existing.id,
        tableNumber: validation.value,
        items: cleanItems,
        total: computeOrderTotal(cleanItems),
        createdAt: existing.createdAt,
        updatedAt: nowIso()
      };
      result = updateOrder(updated);
    } else {
      var newOrder = {
        id: generateId("order"),
        tableNumber: validation.value,
        items: cleanItems,
        total: computeOrderTotal(cleanItems),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      result = addOrder(newOrder);
    }

    if (!result.success) {
      showFieldError("orderError", result.message || "Could not save the order. Please try again.");
      return;
    }

    showToast(appState.editingOrderId ? "Order updated." : "Order saved.");
    resetBuilderState();
    switchView("home");
  }

  function cancelBuilder() {
    var hadContent = appState.cart.length > 0;
    if (hadContent) {
      var ok = window.confirm("Discard this order? Any unsaved items will be lost.");
      if (!ok) return;
    }
    resetBuilderState();
    switchView("home");
  }

  // --- Delete confirmation dialog ---

  var pendingDeleteId = null;

  function confirmDeleteOrder(order) {
    pendingDeleteId = order.id;
    var dialog = document.getElementById("confirmDialog");
    var message = document.getElementById("dialogMessage");
    if (message) {
      message.textContent = "This will permanently delete the order for Table " + order.tableNumber + ". This cannot be undone.";
    }
    if (dialog) dialog.hidden = false;
  }

  function closeDeleteDialog() {
    pendingDeleteId = null;
    var dialog = document.getElementById("confirmDialog");
    if (dialog) dialog.hidden = true;
  }

  function performDelete() {
    if (!pendingDeleteId) { closeDeleteDialog(); return; }
    var result = deleteOrder(pendingDeleteId);
    closeDeleteDialog();
    if (result.success) {
      showToast("Order deleted.");
    } else {
      showToast(result.message || "Could not delete the order.", true);
    }
    renderHome();
  }

  // --- Wiring ---

  function initApp() {
    var newOrderBtn = document.getElementById("newOrderBtn");
    if (newOrderBtn) newOrderBtn.addEventListener("click", openNewOrder);

    var backBtn = document.getElementById("backToHomeBtn");
    if (backBtn) backBtn.addEventListener("click", cancelBuilder);

    var cancelBtn = document.getElementById("cancelOrderBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", cancelBuilder);

    var saveBtn = document.getElementById("saveOrderBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveCurrentOrder);

    var searchInput = document.getElementById("menuSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        appState.search = searchInput.value || "";
        renderMenuGrid();
      });
    }

    var dialogCancelBtn = document.getElementById("dialogCancelBtn");
    if (dialogCancelBtn) dialogCancelBtn.addEventListener("click", closeDeleteDialog);
    var dialogConfirmBtn = document.getElementById("dialogConfirmBtn");
    if (dialogConfirmBtn) dialogConfirmBtn.addEventListener("click", performDelete);

    window.addEventListener("beforeunload", function (e) {
      if (appState.view === "builder" && appState.cart.length) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    renderHome();
  }

  // =======================================================================
  // 7. RECEIPT PAGES
  // =======================================================================

  function receiptSetError(message) {
    var errorBox = document.getElementById("receiptError");
    var content = document.getElementById("receiptContent");
    if (content) content.hidden = true;
    if (errorBox) {
      errorBox.hidden = false;
      clearNode(errorBox);
      errorBox.appendChild(el("p", { class: "receipt-error-title" }, "Unable to load this receipt"));
      errorBox.appendChild(el("p", null, message));
      var backLink = el("a", { href: "index.html", class: "btn btn-outline" }, "Back to orders");
      errorBox.appendChild(backLink);
    }
  }

  function renderReceiptItems(order, receiptTypeFilter) {
    if (receiptTypeFilter === "all") return order.items;
    return order.items.filter(function (it) { return it.receiptType === receiptTypeFilter; });
  }

  function initReceipt(receiptType) {
  var orderId = getQueryParam("order");

  if (!orderId) {
    receiptSetError(
      "No order was specified. Open a receipt from the Saved Orders list."
    );
    return;
  }

  var order;

  try {
    order = getOrderById(orderId);
  } catch (err) {
    console.error("MohanPOS: error loading order for receipt.", err);
    receiptSetError("Something went wrong while loading this order.");
    return;
  }

  if (storageUnavailable) {
    receiptSetError(
      "Local storage is unavailable in this browser, so saved orders cannot be read."
    );
    return;
  }

  if (!order) {
    receiptSetError(
      "The order may have been deleted or is unavailable."
    );
    return;
  }

  var items = renderReceiptItems(
    order,
    receiptType === "bill" ? "all" : receiptType
  );

  document.getElementById("receiptError").hidden = true;

  var content = document.getElementById("receiptContent");

  if (content) {
    content.hidden = false;
  }

  /* =========================================================
     KOT RECEIPT
     Main Kitchen + Tandoor
     Only:
       KOT
       Table number
       Item name
       Quantity
     ========================================================= */

  if (receiptType !== "bill") {

    var tableEl = document.getElementById("receiptTable");

    if (tableEl) {
      tableEl.textContent = order.tableNumber
        ? String(order.tableNumber)
        : "—";
    }

    var body = document.getElementById("receiptItems");

    if (!body) {
      return;
    }

    clearNode(body);

    if (!items.length) {

      body.appendChild(
        el(
          "p",
          { class: "receipt-empty" },
          "No items for this section of the kitchen."
        )
      );

    } else {

      items.forEach(function (it) {

        var row = el("div", {
          class: "receipt-row"
        });

        /* ITEM NAME */
        var nameCol = el(
          "span",
          {
            class: "receipt-row-name"
          },
          it.name +
            (it.portion !== "Regular"
              ? " (" + it.portion + ")"
              : "")
        );

        /* QUANTITY */
        var qtyCol = el(
          "span",
          {
            class: "receipt-row-qty"
          },
          "x" + safeQuantity(it.quantity)
        );

        row.appendChild(nameCol);
        row.appendChild(qtyCol);

        body.appendChild(row);
      });
    }

    /*
     * Do NOT calculate total for KOT.
     * Do NOT add price.
     * Do NOT add invoice.
     * Do NOT add date/time.
     * Do NOT add payment.
     * Do NOT add restaurant information.
     */

    var totalRow = document.getElementById("receiptTotalRow");

    if (totalRow) {
      totalRow.hidden = true;
    }

    var printBtn = document.getElementById("printBtn");

    if (printBtn) {

      printBtn.onclick = function () {
        window.print();
      };

    }

    /*
     * VERY IMPORTANT:
     * Stop here so KOT does not execute bill logic.
     */

    return;
  }


  /* =========================================================
     BILL RECEIPT
     Existing bill functionality
     ========================================================= */

  var restaurantEl =
    document.getElementById("receiptRestaurant");

  if (restaurantEl) {
    restaurantEl.textContent = RESTAURANT_NAME;
  }


  var tableElBill =
    document.getElementById("receiptTable");

  if (tableElBill) {
    tableElBill.textContent =
      "Table: " + order.tableNumber;
  }


  var orderIdEl =
    document.getElementById("receiptOrderId");

  if (orderIdEl) {
    orderIdEl.textContent =
      "Order #" +
      order.id.slice(-6).toUpperCase();
  }


  var timeEl =
    document.getElementById("receiptTime");

  if (timeEl) {
    timeEl.textContent =
      formatDateTime(order.updatedAt);
  }


  var bodyBill =
    document.getElementById("receiptItems");

  if (!bodyBill) {
    return;
  }

  clearNode(bodyBill);


  if (!items.length) {

    bodyBill.appendChild(
      el(
        "p",
        { class: "receipt-empty" },
        "This order has no billable items."
      )
    );

  } else {

    items.forEach(function (it) {

      var row =
        el("div", {
          class: "receipt-row"
        });


      var nameCol =
        el(
          "span",
          {
            class: "receipt-row-name"
          },
          it.name +
            (it.portion !== "Regular"
              ? " (" + it.portion + ")"
              : "")
        );


      var qtyCol =
        el(
          "span",
          {
            class: "receipt-row-qty"
          },
          "x" + safeQuantity(it.quantity)
        );


      row.appendChild(nameCol);
      row.appendChild(qtyCol);


      if (receiptType === "bill") {

        row.appendChild(
          el(
            "span",
            {
              class: "receipt-row-price"
            },
            formatCurrency(it.price)
          )
        );


        row.appendChild(
          el(
            "span",
            {
              class: "receipt-row-subtotal"
            },
            formatCurrency(
              it.price * it.quantity
            )
          )
        );

      }


      bodyBill.appendChild(row);

    });

  }


  var totalRowBill =
    document.getElementById("receiptTotalRow");


  if (totalRowBill) {

    var total =
      computeOrderTotal(order.items);

    var totalEl =
      document.getElementById("receiptTotal");

    if (totalEl) {
      totalEl.textContent =
        formatCurrency(total);
    }

    totalRowBill.hidden = false;
  }


  var printBtnBill =
    document.getElementById("printBtn");


  if (printBtnBill) {

    printBtnBill.onclick = function () {
      window.print();
    };

  }
}
  // ---------------------------------------------------------------------
  // 8. SERVICE WORKER REGISTRATION (safe, non-blocking)
  // ---------------------------------------------------------------------

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      // Relative path so this works under a GitHub Pages sub-path too.
      navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
        console.error("Service worker registration failed:", error);
      });
    });
  }
  registerServiceWorker();

  // ---------------------------------------------------------------------
  // 9. PUBLIC API
  // ---------------------------------------------------------------------

  window.MohanPOS = {
    MENU: MENU,
    CATEGORY_LABELS: CATEGORY_LABELS,
    RECEIPT_LABELS: RECEIPT_LABELS,
    RESTAURANT_NAME: RESTAURANT_NAME,
    formatCurrency: formatCurrency,
    loadOrders: loadOrders,
    saveOrders: saveOrders,
    getOrderById: getOrderById,
    updateOrder: updateOrder,
    deleteOrder: deleteOrder,
    initApp: initApp,
    initReceipt: initReceipt
  };
})();