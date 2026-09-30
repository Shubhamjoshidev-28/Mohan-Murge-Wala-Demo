/*!
 * Mohan Murge Wala — service-worker.js
 * Caches the static app shell so the demo can load offline after the
 * first successful visit. Uses relative URLs throughout so this also
 * works when the site is hosted under a GitHub Pages repository
 * sub-path (e.g. https://username.github.io/repo-name/).
 */

"use strict";

// Bump this string whenever any cached file changes so old caches are
// discarded on the next activation.
var CACHE_VERSION = "mohan-pos-v3";

// Paths are relative to this file's own location (the app root), which
// keeps things correct on GitHub Pages sub-paths.
var APP_SHELL = [
  "./",
  "./index.html",
  "./bill-recepit.html",
  "./kitchen-recepit.html",
  "./tandoor-recepit.html",
  "./style.css",
  "./bill.css",
  "./main.js",
  "./bridge-print.js",
  "./html2canvas.min.js",
  "./bill-upi-qr.png",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) {
        // addAll fails atomically if any single request fails, so cache
        // items individually and tolerate a missing asset without
        // breaking installation entirely.
        return Promise.all(
          APP_SHELL.map(function (url) {
            return cache.add(url).catch(function (err) {
              console.error("Service worker: failed to cache", url, err);
            });
          })
        );
      })
      .catch(function (err) {
        console.error("Service worker: cache installation failed.", err);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_VERSION) {
              return caches.delete(key);
            }
            return null;
          })
        );
      })
      .catch(function (err) {
        console.error("Service worker: cache cleanup failed.", err);
      })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  // Only handle safe, same-origin GET requests. Let everything else
  // (POST, cross-origin fonts/analytics, chrome-extension:// etc.) pass
  // straight through to the network so we never cache something unsafe.
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      var networkFetch = fetch(request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            var responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(request, responseClone).catch(function (err) {
                console.error("Service worker: failed to update cache for", request.url, err);
              });
            });
          }
          return networkResponse;
        })
        .catch(function () {
          // Offline and not cached: fall back to the cached home page for
          // navigations so the app still opens; otherwise fail quietly.
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return cachedResponse;
        });

      return cachedResponse || networkFetch;
    }).catch(function (err) {
      console.error("Service worker: fetch handling failed.", err);
      return fetch(request);
    })
  );
});