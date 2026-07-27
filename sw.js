const CACHE = "ahorro-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./fortuner.jpg",
  "./widget-card.json",
  "./widget-data.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isDoc = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");

  // HTML: red primero (siempre la última versión si hay conexión), con respaldo offline
  if (isDoc) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // Resto de assets: caché primero, con actualización en segundo plano
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

/* ---------- Widget (Windows 11 / navegadores compatibles) ---------- */
async function renderWidget(widget) {
  if (!widget || !widget.definition) return;
  try {
    const tpl = await (await fetch(widget.definition.msAcTemplate)).text();
    const data = await (await fetch(widget.definition.data)).text();
    await self.widgets.updateByTag(widget.definition.tag, { template: tpl, data });
  } catch (e) { /* sin datos aún */ }
}

self.addEventListener("widgetinstall", e => e.waitUntil(renderWidget(e.widget)));
self.addEventListener("widgetresume", e => e.waitUntil(renderWidget(e.widget)));

/* ---------- Notificaciones de pagos ---------- */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./index.html?tab=finanzas";
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if ("focus" in c) { c.postMessage({ type: "go-finanzas" }); return c.focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});

// La app envía el progreso actual; refrescamos el widget con datos reales.
self.addEventListener("message", e => {
  const msg = e.data;
  if (!msg || msg.type !== "widget-update" || !self.widgets) return;
  e.waitUntil((async () => {
    try {
      const tpl = await (await fetch("./widget-card.json")).text();
      await self.widgets.updateByTag("ahorro", { template: tpl, data: JSON.stringify(msg.data) });
    } catch (err) { /* widget no instalado */ }
  })());
});
