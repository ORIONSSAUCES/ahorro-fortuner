# 🚙 Mi Ahorro · Toyota Fortuner

PWA de ahorro con objetivo, en español, mobile-first, sin backend. Todos los datos se guardan en el dispositivo (`localStorage`) y la app funciona offline.

## Funciones
- 🎯 Objetivo configurable (default ₲ 230.000.000) para comprar una Toyota Fortuner.
- ➕ Registro de movimientos: depósitos y retiros con monto, fecha y nota.
- 📊 Total acumulado, restante y % de progreso con barra visual.
- ⏳ Estimación de tiempo restante según el ritmo real de ahorro.
- 💬 Mensajes motivadores según el progreso.
- 🗓️ Metas de ahorro mensual sugeridas (12 / 24 / 36 meses).
- 🏦 Recordatorio de dónde está guardado el dinero (banco y N° de cuenta).
- 💾 Exportar / importar respaldo en JSON.
- 📱 Instalable como app + accesos directos (Android) y widget (Windows 11).

## Uso
Servila por HTTP para habilitar instalación y modo offline:

```bash
python -m http.server 8080
```

Luego abrí `http://localhost:8080`.

## Tecnología
HTML + CSS + JavaScript puro. Sin dependencias ni build. Manifest + Service Worker.
