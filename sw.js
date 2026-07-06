const CACHE = "ahorro-v3";
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
